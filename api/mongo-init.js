print('MongoDB initialization script starting...');

// Use the admin database for creating users
db = db.getSiblingDB('admin');

try {
    // Verify root user authentication is working
    db.auth('admin', 'password');
    print('Root authentication successful');
} catch (error) {
    print('Root authentication error: ' + error);
}

// Switch to the application database
db = db.getSiblingDB('family_kitchen');

// Create initial collections
db.createCollection('users');
db.createCollection('recipes');
db.createCollection('categories');
db.createCollection('ingredients');
db.createCollection('households');

// Insert some default categories
try {
    db.categories.insertMany([
        { name: 'breakfast' },
        { name: 'lunch' },
        { name: 'dinner' },
        { name: 'dessert' },
        { name: 'snack' },
        { name: 'beverage' }
    ]);
    print('Default categories inserted successfully');
} catch (error) {
    print('Categories insertion error: ' + error);
}

print('MongoDB initialization completed');
