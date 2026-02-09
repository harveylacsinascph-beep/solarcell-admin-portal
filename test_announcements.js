// Test script for announcements functionality
const API_BASE_URL = 'http://localhost:3001/api';

async function testAnnouncements() {
  console.log('Testing announcements API...');

  try {
    // Test GET announcements
    console.log('1. Getting all announcements...');
    const getResponse = await fetch(`${API_BASE_URL}/announcements`);
    const announcements = await getResponse.json();
    console.log('Current announcements:', announcements);

    // Test POST announcement
    console.log('2. Posting new announcement...');
    const postResponse = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Announcement',
        content: 'This is a test announcement to verify functionality.'
      })
    });

    if (postResponse.ok) {
      const newAnnouncement = await postResponse.json();
      console.log('✅ Announcement posted successfully:', newAnnouncement);

      // Test GET again to see the new announcement
      console.log('3. Getting announcements after posting...');
      const getResponse2 = await fetch(`${API_BASE_URL}/announcements`);
      const announcements2 = await getResponse2.json();
      console.log('Updated announcements:', announcements2);
    } else {
      console.error('❌ Failed to post announcement:', postResponse.status, postResponse.statusText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAnnouncements();
