import { Router, Request, Response } from 'express';

const router = Router();

// In-memory store (replace with database in production)
const userDataStore: Record<string, any> = {};

/**
 * POST /api/auth/user - Save user information
 */
router.post('/user', (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || 'default-user';
    const userData = req.body;

    userDataStore[userId] = userData;
    
    console.log(`✅ User data saved for ${userId}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'User information saved successfully',
      userId 
    });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save user information' 
    });
  }
});

/**
 * GET /api/auth/user - Retrieve user information
 */
router.get('/user', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'default-user';
    
    if (!userDataStore[userId]) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      data: userDataStore[userId],
      userId 
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve user information' 
    });
  }
});

/**
 * PUT /api/auth/user - Update user information
 */
router.put('/user', (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || 'default-user';
    
    if (!userDataStore[userId]) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    userDataStore[userId] = { ...userDataStore[userId], ...req.body };
    
    console.log(`✅ User data updated for ${userId}`);
    
    res.json({ 
      success: true, 
      message: 'User information updated successfully',
      userId 
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user information' 
    });
  }
});

/**
 * DELETE /api/auth/user - Delete user information
 */
router.delete('/user', (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || 'default-user';
    
    if (!userDataStore[userId]) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    delete userDataStore[userId];
    
    console.log(`🗑️ User data deleted for ${userId}`);
    
    res.json({ 
      success: true, 
      message: 'User information deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user information' 
    });
  }
});

export { router as authRoutes };
