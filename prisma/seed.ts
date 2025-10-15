import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Clean existing data (optional - remove if you want to keep existing data)
    await prisma.product.deleteMany()
    await prisma.farmerProfile.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()

    console.log('🧹 Cleaned existing data')

    // Create farmers
    const farmer1 = await prisma.user.create({
        data: {
            email: 'john@greenvalleyfarm.com',
            name: 'John Smith',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.FARMER,
            emailVerified: new Date(),
        },
    })

    const farmer2 = await prisma.user.create({
        data: {
            email: 'sarah@sunnyacres.com',
            name: 'Sarah Johnson',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.FARMER,
            emailVerified: new Date(),
        },
    })

    const farmer3 = await prisma.user.create({
        data: {
            email: 'mike@organicharvest.com',
            name: 'Mike Brown',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.FARMER,
            emailVerified: new Date(),
        },
    })

    console.log('👨‍🌾 Created farmers')

    // Create customer
    const customer = await prisma.user.create({
        data: {
            email: 'customer@example.com',
            name: 'Jane Doe',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.CUSTOMER,
            emailVerified: new Date(),
        },
    })

    console.log('👤 Created customer')

    // Create farmer profiles
    await prisma.farmerProfile.create({
        data: {
            userId: farmer1.id,
            farmName: 'Green Valley Farm',
            description: 'Organic vegetables and herbs since 1995',
            address: '123 Farm Road',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            latitude: 39.7817,
            longitude: -89.6501,
            phone: '+1 (217) 555-0123',
            website: 'https://greenvalleyfarm.com',
        },
    })

    await prisma.farmerProfile.create({
        data: {
            userId: farmer2.id,
            farmName: 'Sunny Acres',
            description: 'Fresh fruits and dairy products',
            address: '456 Country Lane',
            city: 'Portland',
            state: 'OR',
            zipCode: '97201',
            latitude: 45.5152,
            longitude: -122.6784,
            phone: '+1 (503) 555-0456',
            website: 'https://sunnyacres.com',
        },
    })

    await prisma.farmerProfile.create({
        data: {
            userId: farmer3.id,
            farmName: 'Organic Harvest',
            description: 'Certified organic produce and eggs',
            address: '789 Green Street',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            latitude: 30.2672,
            longitude: -97.7431,
            phone: '+1 (512) 555-0789',
        },
    })

    console.log('🏡 Created farmer profiles')

    // Create products for farmer 1
    await prisma.product.createMany({
        data: [
            {
                name: 'Organic Tomatoes',
                description: 'Fresh, juicy heirloom tomatoes',
                price: 4.99,
                unit: 'lb',
                category: 'Vegetables',
                imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800',
                inStock: true,
                farmerId: farmer1.id,
            },
            {
                name: 'Fresh Basil',
                description: 'Aromatic Italian basil',
                price: 3.49,
                unit: 'bunch',
                category: 'Herbs',
                imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=800',
                inStock: true,
                farmerId: farmer1.id,
            },
            {
                name: 'Green Bell Peppers',
                description: 'Crisp and sweet',
                price: 2.99,
                unit: 'lb',
                category: 'Vegetables',
                imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800',
                inStock: true,
                farmerId: farmer1.id,
            },
        ],
    })

    // Create products for farmer 2
    await prisma.product.createMany({
        data: [
            {
                name: 'Fresh Strawberries',
                description: 'Sweet, locally grown strawberries',
                price: 5.99,
                unit: 'lb',
                category: 'Fruits',
                imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800',
                inStock: true,
                farmerId: farmer2.id,
            },
            {
                name: 'Raw Honey',
                description: 'Pure wildflower honey from our hives',
                price: 8.99,
                unit: 'jar',
                category: 'Honey',
                imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784faf?w=800',
                inStock: true,
                farmerId: farmer2.id,
            },
            {
                name: 'Blueberries',
                description: 'Fresh picked this morning',
                price: 6.99,
                unit: 'lb',
                category: 'Fruits',
                imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800',
                inStock: true,
                farmerId: farmer2.id,
            },
            {
                name: 'Whole Milk',
                description: 'Fresh from grass-fed cows',
                price: 4.49,
                unit: 'bottle',
                category: 'Dairy',
                imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800',
                inStock: false,
                farmerId: farmer2.id,
            },
        ],
    })

    // Create products for farmer 3
    await prisma.product.createMany({
        data: [
            {
                name: 'Free-Range Eggs',
                description: 'Farm fresh eggs from happy chickens',
                price: 5.49,
                unit: 'dozen',
                category: 'Eggs',
                imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800',
                inStock: true,
                farmerId: farmer3.id,
            },
            {
                name: 'Organic Carrots',
                description: 'Crunchy and sweet',
                price: 3.99,
                unit: 'lb',
                category: 'Vegetables',
                imageUrl: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800',
                inStock: true,
                farmerId: farmer3.id,
            },
            {
                name: 'Mixed Salad Greens',
                description: 'Fresh spring mix',
                price: 4.49,
                unit: 'bag',
                category: 'Vegetables',
                imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
                inStock: true,
                farmerId: farmer3.id,
            },
            {
                name: 'Organic Apples',
                description: 'Crisp Honeycrisp apples',
                price: 4.99,
                unit: 'lb',
                category: 'Fruits',
                imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800',
                inStock: true,
                farmerId: farmer3.id,
            },
        ],
    })

    console.log('🥕 Created products')

    console.log('✅ Seed completed successfully!')
    console.log('\n📧 Test accounts:')
    console.log('Farmer 1: john@greenvalleyfarm.com / password123')
    console.log('Farmer 2: sarah@sunnyacres.com / password123')
    console.log('Farmer 3: mike@organicharvest.com / password123')
    console.log('Customer: customer@example.com / password123')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:')
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })