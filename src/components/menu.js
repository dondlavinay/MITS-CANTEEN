import React from 'react';

const Menu = () => {
    const menuItems = [
        { id: 1, name: 'Vegetable Sandwich', price: 50 },
        { id: 2, name: 'Cheese Pizza', price: 150 },
        { id: 3, name: 'Pasta', price: 120 },
        { id: 4, name: 'Fruit Salad', price: 80 },
        { id: 5, name: 'Cold Drink', price: 30 },
    ];

    return (
        <div className="menu">
            <h2>Canteen Menu</h2>
            <ul>
                {menuItems.map(item => (
                    <li key={item.id}>
                        {item.name} - ₹{item.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Menu;