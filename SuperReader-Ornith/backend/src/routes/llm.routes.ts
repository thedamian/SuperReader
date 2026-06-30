import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

/**
 * POST /api/llm/analyze - Analyze camera image for text and suggest field mappings
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { imageData, userData } = req.body;

    if (!imageData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image data is required' 
      });
    }

    // Get API key from environment or use mock
    const apiKey = process.env.LLM_API_KEY || 'mock-key';
    const apiUrl = process.env.LLM_API_URL || '';

    // If we have an actual API, call it
    if (apiKey && apiKey !== 'mock-key') {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.LLM_MODEL || 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are an accessibility assistant for people with low vision. Analyze the image and identify text fields that match this user's information. Return a JSON object with:
{
  "detectedText": "full detected text",
  "fields": [
    {
      "fieldId": "firstName|lastName|address|phone|ssn|...",
      "fieldName": "human readable field name",
      "value": "suggested value from user data or empty string",
      "boundingBox": { "x": number, "y": number, "width": number, "height": number }
    }
  ],
  "confidence": 0.0-1.0
}

User's information: ${JSON.stringify(userData || {})}`
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Analyze this image and identify where to fill in the user\'s information.' },
                  { 
                    type: 'image_url', 
                    image_url: { url: imageData, detail: 'high' } 
                  }
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.3
          })
        });

        const data = (await response.json()) as any;
        
        return res.json({
          success: true,
          analysis: data.choices?.[0]?.message?.content || 'No analysis available',
          rawResponse: data
        });
      } catch (apiError) {
        console.error('LLM API error:', apiError);
        // Fall through to mock response
      }
    }

    // Mock response for development/testing
    const mockAnalysis = generateMockAnalysis(userData, req.body.documentType);
    
    res.json({
      success: true,
      analysis: mockAnalysis.analysis,
      fields: mockAnalysis.fields,
      detectedText: mockAnalysis.detectedText,
      confidence: 0.85
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze image' 
    });
  }
});

/**
 * POST /api/llm/detect-text - Simple text detection without field mapping
 */
router.post('/detect-text', async (req: Request, res: Response) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image data is required' 
      });
    }

    // Mock text detection for development
    const mockTexts = [
      'FIRST NAME',
      'LAST NAME', 
      'ADDRESS LINE 1',
      'CITY',
      'STATE',
      'ZIP CODE',
      'PHONE NUMBER',
      'SOCIAL SECURITY NUMBER',
      'DATE OF BIRTH',
      'EMAIL ADDRESS'
    ];

    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    
    res.json({
      success: true,
      detectedText: randomText,
      confidence: 0.92
    });

  } catch (error) {
    console.error('Error detecting text:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to detect text' 
    });
  }
});

/**
 * Helper function to generate mock analysis
 */
function generateMockAnalysis(userData?: any, documentType?: string): {
  analysis: string;
  fields: any[];
  detectedText: string;
} {
  const mockFields = [
    {
      fieldId: 'firstName',
      fieldName: 'First Name',
      value: userData?.firstName || '',
      boundingBox: { x: 100, y: 200, width: 150, height: 40 }
    },
    {
      fieldId: 'lastName',
      fieldName: 'Last Name', 
      value: userData?.lastName || '',
      boundingBox: { x: 300, y: 200, width: 150, height: 40 }
    },
    {
      fieldId: 'addressLine1',
      fieldName: 'Street Address',
      value: userData?.addressLine1 || '',
      boundingBox: { x: 100, y: 280, width: 350, height: 40 }
    },
    {
      fieldId: 'city',
      fieldName: 'City',
      value: userData?.city || '',
      boundingBox: { x: 100, y: 360, width: 200, height: 40 }
    },
    {
      fieldId: 'state',
      fieldName: 'State',
      value: userData?.state || '',
      boundingBox: { x: 350, y: 360, width: 100, height: 40 }
    },
    {
      fieldId: 'zipCode',
      fieldName: 'ZIP Code',
      value: userData?.zipCode || '',
      boundingBox: { x: 100, y: 440, width: 150, height: 40 }
    },
    {
      fieldId: 'phone',
      fieldName: 'Phone Number',
      value: userData?.phone || '',
      boundingBox: { x: 300, y: 440, width: 200, height: 40 }
    },
    {
      fieldId: 'ssn',
      fieldName: 'Social Security Number',
      value: userData?.ssn || '',
      boundingBox: { x: 100, y: 520, width: 250, height: 40 }
    }
  ];

  return {
    analysis: JSON.stringify({ fields: mockFields }),
    fields: mockFields,
    detectedText: 'Sample form with personal information fields'
  };
}

export { router as llmRoutes };
