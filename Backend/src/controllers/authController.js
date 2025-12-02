// backend/src/controllers/authController.js
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

// Validation schemas
const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().required(),
  role: Joi.string().valid('patient', 'doctor').required(),
  // Patient fields
  age: Joi.number().when('role', { is: 'patient', then: Joi.required() }),
  disease: Joi.string().when('role', { is: 'patient', then: Joi.required() }),
  hospitalAdmitted: Joi.string().when('role', { is: 'patient', then: Joi.required() }),
  emergencyContact: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    relation: Joi.string().required()
  }).when('role', { is: 'patient', then: Joi.required() }),
  // Doctor fields
  specialization: Joi.string().when('role', { is: 'doctor', then: Joi.required() }),
  workingHospital: Joi.string().when('role', { is: 'doctor', then: Joi.required() }),
  shiftTiming: Joi.object({
    start: Joi.string().required(),
    end: Joi.string().required()
  }).when('role', { is: 'doctor', then: Joi.required() }),
  licenseNumber: Joi.string().when('role', { is: 'doctor', then: Joi.required() })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    // Validate request body
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create(req.body);

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...(user.role === 'patient' && {
          age: user.age,
          disease: user.disease,
          hospitalAdmitted: user.hospitalAdmitted
        }),
        ...(user.role === 'doctor' && {
          specialization: user.specialization,
          workingHospital: user.workingHospital,
          shiftTiming: user.shiftTiming
        })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Get all doctors
// @route   GET /api/auth/doctors
// @access  Private
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('name specialization workingHospital phone shiftTiming');
    
    res.json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

// @desc    Get doctors linked to patient (via appointments)
// @route   GET /api/auth/my-doctors
// @access  Private (Patient only)
exports.getMyDoctors = async (req, res) => {
  try {
    // Find all unique doctors who have appointments with this patient
    const appointments = await Appointment.find({ patient: req.user.id }).select('doctor');
    
    // Extract doctor IDs
    const doctorIds = [...new Set(appointments.map(apt => apt.doctor))];

    const doctors = await User.find({ 
      _id: { $in: doctorIds },
      role: 'doctor' 
    }).select('name specialization workingHospital phone shiftTiming');
    
    res.json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error('Get my doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your doctors',
      error: error.message
    });
  }
};

// @desc    Get all patients (for doctors)
// @route   GET /api/auth/patients
// @access  Private (Doctor only)
exports.getPatients = async (req, res) => {
  try {
    // Find all unique patients who have appointments with this doctor
    const appointments = await Appointment.find({ doctor: req.user.id }).select('patient');
    
    // Extract patient IDs
    const patientIds = [...new Set(appointments.map(apt => apt.patient))];

    const patients = await User.find({ 
      _id: { $in: patientIds },
      role: 'patient' 
    }).select('-password');
    
    res.json({
      success: true,
      patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email address'
      });
    }

    // Generate random 6 digit code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the following code to reset your password:

${resetToken}

If you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Code',
        text: message
      });

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, code and new password'
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code or email, or code expired'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate token so user is logged in
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
