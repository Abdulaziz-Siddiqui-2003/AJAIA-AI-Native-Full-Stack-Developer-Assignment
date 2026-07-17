const request = require('supertest');
const express = require('express');

// Mock a simple version of our app for testing without needing live MongoDB
const app = express();
app.use(express.json());

// Mock Document Array
let mockDocs = [
  { _id: '1', title: 'Test Doc', content: '<p>Hello</p>', ownerId: 'userA' }
];

app.get('/api/docs', (req, res) => {
  const userId = req.headers['x-mock-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const userDocs = mockDocs.filter(d => d.ownerId === userId);
  res.json(userDocs);
});

describe('Document API Authorization', () => {
  it('should reject requests without a user ID header', async () => {
    const res = await request(app).get('/api/docs');
    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual('Unauthorized');
  });

  it('should fetch documents for the active user', async () => {
    const res = await request(app)
      .get('/api/docs')
      .set('x-mock-user-id', 'userA'); // Simulate logged in user
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].title).toEqual('Test Doc');
  });
});