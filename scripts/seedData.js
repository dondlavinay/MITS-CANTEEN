const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
require('dotenv').config();

const menuItems = [
  // Snacks
  { name: 'Samosa', category: 'snacks', price: 15, image: 'images/snacks/samosa.jpeg', description: 'Crispy fried pastry with spiced filling' },
  { name: 'Vada', category: 'snacks', price: 12, image: 'images/snacks/vada.jpeg', description: 'South Indian fried lentil donuts' },
  { name: 'Cutlet', category: 'snacks', price: 20, image: 'images/snacks/cutlet.jpeg', description: 'Crispy vegetable cutlet' },
  { name: 'Pakoda', category: 'snacks', price: 18, image: 'images/snacks/pakoda.jpeg', description: 'Deep fried vegetable fritters' },
  
  // Veg Items
  { name: 'Veg Biryani', category: 'veg', price: 80, image: 'images/veg/biryany.jpeg', description: 'Aromatic rice with vegetables and spices' },
  { name: 'Meals', category: 'veg', price: 60, image: 'images/veg/meals.jpeg', description: 'Traditional South Indian thali' },
  { name: 'Idly', category: 'veg', price: 25, image: 'images/veg/idly.jpeg', description: 'Steamed rice cakes with chutney' },
  { name: 'Chapathi', category: 'veg', price: 30, image: 'images/veg/chapathi.jpeg', description: 'Indian flatbread with curry' },
  
  // Ice Creams
  { name: 'Chocolate Ice Cream', category: 'icecream', price: 30, image: 'images/ice/chocolate.jpeg', description: 'Rich chocolate flavored ice cream' },
  { name: 'Vanilla Ice Cream', category: 'icecream', price: 25, image: 'images/ice/vennala.jpeg', description: 'Classic vanilla ice cream' },
  { name: 'Butterscotch', category: 'icecream', price: 35, image: 'images/ice/butterscotch.jpeg', description: 'Creamy butterscotch ice cream' },
  { name: 'Kulfi', category: 'icecream', price: 40, image: 'images/ice/kulfi.jpeg', description: 'Traditional Indian ice cream' },
  
  // Juices
  { name: 'Orange Juice', category: 'juice', price: 25, image: 'images/juice/orange.jpeg', description: 'Fresh orange juice' },
  { name: 'Apple Juice', category: 'juice', price: 30, image: 'images/juice/apple.jpeg', description: 'Fresh apple juice' },
  { name: 'Mango Juice', category: 'juice', price: 35, image: 'images/juice/mango.jpeg', description: 'Fresh mango juice' },
  { name: 'Lemon Juice', category: 'juice', price: 20, image: 'images/juice/lemon.jpeg', description: 'Fresh lemon juice' },
  
  // Non-Veg
  { name: 'Chicken Biryani', category: 'nonveg', price: 120, image: 'images/non veg/chicken biryani.jpeg', description: 'Aromatic rice with chicken' },
  { name: 'Chicken 65', category: 'nonveg', price: 100, image: 'images/non veg/65.jpeg', description: 'Spicy fried chicken' },
  { name: 'Fish Fry', category: 'nonveg', price: 80, image: 'images/non veg/fish fry.jpeg', description: 'Crispy fried fish' },
  { name: 'Mutton Curry', category: 'nonveg', price: 150, image: 'images/non veg/mutton.jpeg', description: 'Spicy mutton curry' },
  
  // Starters
  { name: 'Paneer Tikka', category: 'starters', price: 90, image: 'images/starters/panner tikka.jpeg', description: 'Grilled cottage cheese cubes' },
  { name: 'Gobi 65', category: 'starters', price: 70, image: 'images/starters/gobi.jpeg', description: 'Spicy cauliflower starter' },
  { name: 'Fish Starter', category: 'starters', price: 110, image: 'images/starters/fish.jpeg', description: 'Spicy fish starter' },
  { name: 'Chicken Rolls', category: 'starters', price: 85, image: 'images/starters/rolls.jpeg', description: 'Chicken wrapped in bread' }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(menuItems);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();