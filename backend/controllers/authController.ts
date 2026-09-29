import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.js';
import { localStore } from '../config/db.js';

const isMongoActive = () => mongoose.connection.readyState === 1;

/**
 * POST /api/auth/signup
 * Registers a new user
 */
export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password, role = 'librarian' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isMongoActive()) {
      const existing = await UserModel.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      const user = await UserModel.create({
        name: name.trim(),
        email: normalizedEmail,
        password: password, // In production hash with bcrypt
        role: role === 'member' ? 'member' : 'librarian',
      });

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
          token: `jwt_token_${user._id}_${Date.now()}`,
        },
      });
    } else {
      const existing = localStore.findUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      const user = localStore.createUser({
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        role: role === 'member' ? 'member' : 'librarian',
      });

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
          token: `jwt_token_${user._id}_${Date.now()}`,
        },
      });
    }
  } catch (error: any) {
    console.error('Error during user signup:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed due to a server error',
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/login
 * Authenticates user credentials
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isMongoActive()) {
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
          token: `jwt_token_${user._id}_${Date.now()}`,
        },
      });
    } else {
      const user = localStore.findUserByEmail(normalizedEmail);
      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
          token: `jwt_token_${user._id}_${Date.now()}`,
        },
      });
    }
  } catch (error: any) {
    console.error('Error during user login:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed due to a server error',
      error: error.message,
    });
  }
}

/**
 * GET /api/auth/users
 * Returns list of registered patrons / librarians
 */
export async function getUsers(req: Request, res: Response) {
  try {
    if (isMongoActive()) {
      const users = await UserModel.find({}, '-password').sort({ createdAt: -1 }).lean();
      return res.json({ success: true, data: users });
    } else {
      const users = localStore.getUsers().map((u) => ({
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }));
      return res.json({ success: true, data: users });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
