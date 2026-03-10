import fs from 'fs';

const filePath = 'c:/Users/캐칭/.gemini/gloo/web/src/data/shops.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

data.forEach(shop => {
    // Generate random realistic operating hours
    const openTime = 9 + Math.floor(Math.random() * 2); // 9 or 10
    const closeTime = 18 + Math.floor(Math.random() * 3); // 18, 19, or 20
    const isClosedOnWeekends = Math.random() > 0.7;

    shop.operating_hours = `평일 ${openTime}:00 - ${closeTime}:00${isClosedOnWeekends ? ' (주말 휴무)' : ' (주말 10:00 - 17:00)'}`;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Successfully updated shops.json with operating hours!');
