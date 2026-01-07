import { PrismaClient, UserRole, OrderStatus, ConversationType, MessageType, GroupCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Clean existing data in correct order (respect foreign keys)
    await prisma.messageReadReceipt.deleteMany()
    await prisma.message.deleteMany()
    await prisma.group.deleteMany()
    await prisma.conversationParticipant.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.review.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.cart.deleteMany()
    await prisma.product.deleteMany()
    await prisma.sellerProfile.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()

    console.log('🧹 Cleaned existing data')

    // Create sellers
    const seller1 = await prisma.user.create({
        data: {
            email: 'john@greenvalleyfarm.com',
            name: 'John Smith',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.USER,
            emailVerified: new Date(),
        },
    })

    const seller2 = await prisma.user.create({
        data: {
            email: 'sarah@sunnyacres.com',
            name: 'Sarah Johnson',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.USER,
            emailVerified: new Date(),
        },
    })

    const seller3 = await prisma.user.create({
        data: {
            email: 'mike@organicharvest.com',
            name: 'Mike Brown',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.USER,
            emailVerified: new Date(),
        },
    })

    console.log('👨‍🌾 Created sellers')

    // Create multiple buyers
    const buyer1 = await prisma.user.create({
        data: {
            email: 'customer@example.com',
            name: 'Jane Doe',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.USER,
            emailVerified: new Date(),
        },
    })

    const buyer2 = await prisma.user.create({
        data: {
            email: 'alex@email.com',
            name: 'Alex Thompson',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.USER,
            emailVerified: new Date(),
        },
    })

    const buyer3 = await prisma.user.create({
        data: {
            email: 'maria@email.com',
            name: 'Maria Garcia',
            password: await bcrypt.hash('password123', 10),
            role: UserRole.USER,
            emailVerified: new Date(),
        },
    })

    console.log('👤 Created buyers')

    // Create seller profiles
    await prisma.sellerProfile.create({
        data: {
            userId: seller1.id,
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

    await prisma.sellerProfile.create({
        data: {
            userId: seller2.id,
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

    await prisma.sellerProfile.create({
        data: {
            userId: seller3.id,
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

    console.log('🏡 Created seller profiles')

    // Create products for seller 1
    const products1 = await prisma.product.createManyAndReturn({
        data: [
            {
                name: 'Organic Tomatoes',
                description: 'Fresh, juicy heirloom tomatoes grown without pesticides. Perfect for salads and sauces.',
                price: 4.99,
                unit: 'lb',
                category: 'Vegetables',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-tomatoes.jpg',
                inStock: true,
                farmerId: seller1.id,
            },
            {
                name: 'Fresh Basil',
                description: 'Aromatic Italian basil, hand-picked daily. Great for pesto and Italian dishes.',
                price: 3.49,
                unit: 'bunch',
                category: 'Herbs',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-spinach.jpg',
                inStock: true,
                farmerId: seller1.id,
            },
            {
                name: 'Green Bell Peppers',
                description: 'Crisp and sweet bell peppers. Excellent for stir-fry or stuffing.',
                price: 2.99,
                unit: 'lb',
                category: 'Vegetables',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-carrots.jpg',
                inStock: true,
                farmerId: seller1.id,
            },
        ],
    })

    // Create products for seller 2
    const products2 = await prisma.product.createManyAndReturn({
        data: [
            {
                name: 'Fresh Strawberries',
                description: 'Sweet, locally grown strawberries picked at peak ripeness.',
                price: 5.99,
                unit: 'lb',
                category: 'Fruits',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-strawberries.jpg',
                inStock: true,
                farmerId: seller2.id,
            },
            {
                name: 'Raw Honey',
                description: 'Pure wildflower honey from our hives. Unfiltered and unpasteurized.',
                price: 8.99,
                unit: 'jar',
                category: 'Honey',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-honey.jpg',
                inStock: true,
                farmerId: seller2.id,
            },
            {
                name: 'Blueberries',
                description: 'Fresh picked this morning. Bursting with antioxidants!',
                price: 6.99,
                unit: 'lb',
                category: 'Fruits',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-blueberries.jpg',
                inStock: true,
                farmerId: seller2.id,
            },
            {
                name: 'Whole Milk',
                description: 'Fresh from grass-fed cows. Creamy and delicious.',
                price: 4.49,
                unit: 'bottle',
                category: 'Dairy',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-milk.jpg',
                inStock: false,
                farmerId: seller2.id,
            },
        ],
    })

    // Create products for seller 3
    const products3 = await prisma.product.createManyAndReturn({
        data: [
            {
                name: 'Free-Range Eggs',
                description: 'Farm fresh eggs from happy chickens roaming our pastures.',
                price: 5.49,
                unit: 'dozen',
                category: 'Eggs',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-zucchini.jpg',
                inStock: true,
                farmerId: seller3.id,
            },
            {
                name: 'Organic Carrots',
                description: 'Crunchy and sweet carrots, perfect for snacking or cooking.',
                price: 3.99,
                unit: 'lb',
                category: 'Vegetables',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-sunflowers.jpg',
                inStock: true,
                farmerId: seller3.id,
            },
            {
                name: 'Mixed Salad Greens',
                description: 'Fresh spring mix with arugula, spinach, and lettuce.',
                price: 4.49,
                unit: 'bag',
                category: 'Vegetables',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-lettuce.jpg',
                inStock: true,
                farmerId: seller3.id,
            },
            {
                name: 'Organic Apples',
                description: 'Crisp Honeycrisp apples, naturally sweet and perfect for snacking.',
                price: 4.99,
                unit: 'lb',
                category: 'Fruits',
                imageUrl: 'https://d2mjb2yuuea7w7.cloudfront.net/seed-products/product-apples.jpg',
                inStock: true,
                farmerId: seller3.id,
            },
        ],
    })

    console.log('🥕 Created products')

    // Create orders (needed for reviews)
    const order1 = await prisma.order.create({
        data: {
            userId: buyer1.id,
            status: OrderStatus.COMPLETED,
            total: 14.97,
            customerName: 'Jane Doe',
            customerEmail: 'customer@example.com',
            customerPhone: '+1 (555) 123-4567',
            deliveryAddress: '100 Main St, Springfield, IL 62701',
            items: {
                create: [
                    { productId: products1[0].id, quantity: 2, priceAtPurchase: 4.99, productName: 'Organic Tomatoes' },
                    { productId: products1[1].id, quantity: 1, priceAtPurchase: 3.49, productName: 'Fresh Basil' },
                ],
            },
        },
    })

    const order2 = await prisma.order.create({
        data: {
            userId: buyer1.id,
            status: OrderStatus.COMPLETED,
            total: 21.47,
            customerName: 'Jane Doe',
            customerEmail: 'customer@example.com',
            customerPhone: '+1 (555) 123-4567',
            deliveryAddress: '100 Main St, Springfield, IL 62701',
            items: {
                create: [
                    { productId: products2[0].id, quantity: 2, priceAtPurchase: 5.99, productName: 'Fresh Strawberries' },
                    { productId: products2[1].id, quantity: 1, priceAtPurchase: 8.99, productName: 'Raw Honey' },
                ],
            },
        },
    })

    const order3 = await prisma.order.create({
        data: {
            userId: buyer2.id,
            status: OrderStatus.COMPLETED,
            total: 15.47,
            customerName: 'Alex Thompson',
            customerEmail: 'alex@email.com',
            customerPhone: '+1 (555) 234-5678',
            deliveryAddress: '200 Oak Ave, Portland, OR 97201',
            items: {
                create: [
                    { productId: products3[0].id, quantity: 1, priceAtPurchase: 5.49, productName: 'Free-Range Eggs' },
                    { productId: products3[3].id, quantity: 2, priceAtPurchase: 4.99, productName: 'Organic Apples' },
                ],
            },
        },
    })

    const order4 = await prisma.order.create({
        data: {
            userId: buyer3.id,
            status: OrderStatus.COMPLETED,
            total: 18.96,
            customerName: 'Maria Garcia',
            customerEmail: 'maria@email.com',
            customerPhone: '+1 (555) 345-6789',
            deliveryAddress: '300 Pine St, Austin, TX 78701',
            items: {
                create: [
                    { productId: products1[0].id, quantity: 2, priceAtPurchase: 4.99, productName: 'Organic Tomatoes' },
                    { productId: products2[2].id, quantity: 1, priceAtPurchase: 6.99, productName: 'Blueberries' },
                ],
            },
        },
    })

    const order5 = await prisma.order.create({
        data: {
            userId: buyer2.id,
            status: OrderStatus.PENDING,
            total: 12.98,
            customerName: 'Alex Thompson',
            customerEmail: 'alex@email.com',
            customerPhone: '+1 (555) 234-5678',
            deliveryAddress: '200 Oak Ave, Portland, OR 97201',
            items: {
                create: [
                    { productId: products2[0].id, quantity: 1, priceAtPurchase: 5.99, productName: 'Fresh Strawberries' },
                    { productId: products2[2].id, quantity: 1, priceAtPurchase: 6.99, productName: 'Blueberries' },
                ],
            },
        },
    })

    console.log('📦 Created orders')

    // Create reviews
    await prisma.review.createMany({
        data: [
            // Reviews for Organic Tomatoes
            {
                rating: 5,
                title: 'Best tomatoes ever!',
                comment: 'These are the most flavorful tomatoes I\'ve ever had. You can really taste the difference from store-bought. Will definitely order again!',
                userId: buyer1.id,
                productId: products1[0].id,
                orderId: order1.id,
            },
            {
                rating: 4,
                title: 'Great quality',
                comment: 'Very fresh and tasty. Slightly smaller than expected but the flavor makes up for it.',
                userId: buyer3.id,
                productId: products1[0].id,
                orderId: order4.id,
            },
            // Review for Fresh Basil
            {
                rating: 5,
                title: 'So aromatic!',
                comment: 'Made the best pesto with this basil. The smell alone is worth it. Stayed fresh for over a week in the fridge.',
                userId: buyer1.id,
                productId: products1[1].id,
                orderId: order1.id,
            },
            // Reviews for Fresh Strawberries
            {
                rating: 5,
                title: 'Incredibly sweet',
                comment: 'These strawberries are like candy! My kids devoured them in one day. So much better than supermarket berries.',
                userId: buyer1.id,
                productId: products2[0].id,
                orderId: order2.id,
            },
            // Review for Raw Honey
            {
                rating: 5,
                title: 'Pure liquid gold',
                comment: 'This honey is absolutely divine. You can taste the wildflowers. Perfect in my morning tea.',
                userId: buyer1.id,
                productId: products2[1].id,
                orderId: order2.id,
            },
            // Review for Blueberries
            {
                rating: 4,
                title: 'Fresh and plump',
                comment: 'Good quality blueberries. A few were slightly overripe but most were perfect.',
                userId: buyer3.id,
                productId: products2[2].id,
                orderId: order4.id,
            },
            // Review for Free-Range Eggs
            {
                rating: 5,
                title: 'Orange yolks!',
                comment: 'The yolks are so orange and rich. You can tell these chickens are well cared for. Breakfast has never been better.',
                userId: buyer2.id,
                productId: products3[0].id,
                orderId: order3.id,
            },
            // Review for Organic Apples
            {
                rating: 5,
                title: 'Perfectly crisp',
                comment: 'These Honeycrisp apples are exactly what apples should taste like. Sweet, crisp, and juicy!',
                userId: buyer2.id,
                productId: products3[3].id,
                orderId: order3.id,
            },
        ],
    })

    // Update product ratings
    const reviewStats = await prisma.review.groupBy({
        by: ['productId'],
        _avg: { rating: true },
        _count: { rating: true },
    })

    for (const stat of reviewStats) {
        await prisma.product.update({
            where: { id: stat.productId },
            data: {
                averageRating: stat._avg.rating,
                reviewCount: stat._count.rating,
            },
        })
    }

    console.log('⭐ Created reviews')

    // Create direct chat conversations
    // Buyer1 <-> Seller1 conversation
    const directChat1 = await prisma.conversation.create({
        data: {
            type: ConversationType.DIRECT,
            participants: {
                create: [
                    { userId: buyer1.id },
                    { userId: seller1.id },
                ],
            },
            messages: {
                create: [
                    {
                        senderId: buyer1.id,
                        content: 'Hi John! I loved the tomatoes I ordered last week. Do you have any tips for storing them?',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                    },
                    {
                        senderId: seller1.id,
                        content: 'Hi Jane! So glad you enjoyed them! For best results, keep them at room temperature away from direct sunlight. Only refrigerate if they\'re very ripe and you need a few more days.',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 2 days ago + 30 min
                    },
                    {
                        senderId: buyer1.id,
                        content: 'Perfect, thank you! When will you have more heirloom varieties available?',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                    },
                    {
                        senderId: seller1.id,
                        content: 'We\'ll have Cherokee Purple and Brandywine varieties ready next week! I can message you when they\'re listed.',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000), // 1 day ago + 15 min
                    },
                    {
                        senderId: buyer1.id,
                        content: 'That would be amazing! Thank you so much! 🍅',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
                    },
                ],
            },
        },
    })

    // Buyer2 <-> Seller2 conversation
    const directChat2 = await prisma.conversation.create({
        data: {
            type: ConversationType.DIRECT,
            participants: {
                create: [
                    { userId: buyer2.id },
                    { userId: seller2.id },
                ],
            },
            messages: {
                create: [
                    {
                        senderId: buyer2.id,
                        content: 'Hello Sarah! Is the raw honey good for allergies? I\'ve heard local honey can help.',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    },
                    {
                        senderId: seller2.id,
                        content: 'Hi Alex! Yes, many of our customers swear by it for seasonal allergies. The theory is that local pollen in the honey helps build immunity. I\'d recommend starting with a teaspoon daily a few months before allergy season.',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
                    },
                    {
                        senderId: buyer2.id,
                        content: 'Great info! I\'ll order some. Do you also sell beeswax candles?',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    },
                    {
                        senderId: seller2.id,
                        content: 'Not yet, but we\'re planning to add them this fall! I\'ll keep you posted.',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
                    },
                ],
            },
        },
    })

    // Buyer3 <-> Seller3 conversation
    const directChat3 = await prisma.conversation.create({
        data: {
            type: ConversationType.DIRECT,
            participants: {
                create: [
                    { userId: buyer3.id },
                    { userId: seller3.id },
                ],
            },
            messages: {
                create: [
                    {
                        senderId: buyer3.id,
                        content: 'Hi Mike! Can I visit your farm to see the chickens? My daughter would love it!',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    },
                    {
                        senderId: seller3.id,
                        content: 'Hi Maria! Absolutely! We do farm tours every Saturday from 10am-2pm. No reservation needed. The kids love collecting eggs!',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
                    },
                    {
                        senderId: buyer3.id,
                        content: 'Perfect! We\'ll come this Saturday. Is there a fee?',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                    },
                    {
                        senderId: seller3.id,
                        content: 'It\'s free! We just ask that you buy something from the farm stand 😊 See you Saturday!',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
                    },
                    {
                        senderId: buyer3.id,
                        content: 'We had such a great time! Sofia is still talking about the baby chicks. Thank you!',
                        type: MessageType.TEXT,
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    },
                ],
            },
        },
    })

    console.log('💬 Created direct chats')

    // Create group conversations
    // Group 1: Local Food Community
    const groupConvo1 = await prisma.conversation.create({
        data: {
            type: ConversationType.GROUP,
            participants: {
                create: [
                    { userId: seller1.id },
                    { userId: seller2.id },
                    { userId: seller3.id },
                    { userId: buyer1.id },
                    { userId: buyer2.id },
                    { userId: buyer3.id },
                ],
            },
        },
    })

    await prisma.group.create({
        data: {
            conversationId: groupConvo1.id,
            name: 'LocalRoots Community',
            description: 'A place for local farmers and food lovers to connect, share tips, and discuss all things local food!',
            category: GroupCategory.GENERAL,
            createdById: seller1.id,
        },
    })

    await prisma.message.createMany({
        data: [
            {
                conversationId: groupConvo1.id,
                senderId: seller1.id,
                content: 'Welcome everyone to the LocalRoots Community! Feel free to introduce yourselves and share what brings you here.',
                type: MessageType.SYSTEM,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo1.id,
                senderId: buyer1.id,
                content: 'Hi all! I\'m Jane, a home cook passionate about supporting local farms. Excited to be here!',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo1.id,
                senderId: seller2.id,
                content: 'Welcome Jane! I\'m Sarah from Sunny Acres. We grow berries and keep bees. Always happy to chat about sustainable farming!',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo1.id,
                senderId: buyer2.id,
                content: 'Hey everyone! Alex here. I\'m trying to reduce my grocery store trips and buy more directly from farmers. Any tips?',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo1.id,
                senderId: seller3.id,
                content: 'Great goal Alex! I recommend starting with eggs and produce - they\'re usually available year-round. Build relationships with 2-3 farmers and you\'ll be set!',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo1.id,
                senderId: buyer3.id,
                content: 'Just wanted to share - took my daughter to Organic Harvest last weekend and she loved it! Great experience for kids.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo1.id,
                senderId: seller1.id,
                content: 'That\'s wonderful! We\'re thinking of doing farm tours too. Would anyone be interested in a harvest festival this fall?',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo1.id,
                senderId: buyer1.id,
                content: 'Yes! Count me in! A harvest festival sounds amazing 🎃',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
            },
        ],
    })

    // Group 2: Recipe Sharing
    const groupConvo2 = await prisma.conversation.create({
        data: {
            type: ConversationType.GROUP,
            participants: {
                create: [
                    { userId: buyer1.id },
                    { userId: buyer2.id },
                    { userId: buyer3.id },
                    { userId: seller2.id },
                ],
            },
        },
    })

    await prisma.group.create({
        data: {
            conversationId: groupConvo2.id,
            name: 'Farm Fresh Recipes',
            description: 'Share your favorite recipes using local, seasonal ingredients!',
            category: GroupCategory.RECIPES,
            createdById: buyer1.id,
        },
    })

    await prisma.message.createMany({
        data: [
            {
                conversationId: groupConvo2.id,
                senderId: buyer1.id,
                content: 'Started this group for us to share recipes! I\'ll kick things off - made an amazing caprese salad with Green Valley\'s tomatoes and basil.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo2.id,
                senderId: buyer3.id,
                content: 'Love this idea! I made strawberry shortcake with Sunny Acres berries last night. So much better than store-bought!',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo2.id,
                senderId: seller2.id,
                content: 'Maria, if you want to try something different, our honey pairs beautifully with strawberries! Just drizzle a little on top.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo2.id,
                senderId: buyer2.id,
                content: 'Anyone have good egg recipes? I bought a ton of eggs and need ideas beyond scrambled!',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo2.id,
                senderId: buyer1.id,
                content: 'Try shakshuka! Eggs poached in spiced tomato sauce. Perfect way to use both eggs and tomatoes from the market.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo2.id,
                senderId: buyer3.id,
                content: 'Ooh shakshuka is so good! I also make a lot of frittatas - easy to throw in whatever veggies you have.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
        ],
    })

    // Group 3: Farmers Tips & News
    const groupConvo3 = await prisma.conversation.create({
        data: {
            type: ConversationType.GROUP,
            participants: {
                create: [
                    { userId: seller1.id },
                    { userId: seller2.id },
                    { userId: seller3.id },
                ],
            },
        },
    })

    await prisma.group.create({
        data: {
            conversationId: groupConvo3.id,
            name: 'Farmers Network',
            description: 'A private group for LocalRoots farmers to share tips, discuss challenges, and support each other.',
            category: GroupCategory.TIPS,
            createdById: seller1.id,
        },
    })

    await prisma.message.createMany({
        data: [
            {
                conversationId: groupConvo3.id,
                senderId: seller1.id,
                content: 'Hey fellow farmers! Created this space for us to help each other out. Feel free to ask questions or share what\'s working for you.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo3.id,
                senderId: seller2.id,
                content: 'Great idea John! Quick question - anyone dealing with aphids this season? They\'re all over my strawberry plants.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo3.id,
                senderId: seller3.id,
                content: 'Try introducing ladybugs! They\'re natural predators. I buy them online and release them at dusk. Works great.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo3.id,
                senderId: seller2.id,
                content: 'Thanks Mike! Will try that. Also, has anyone used the LocalRoots analytics? Trying to figure out which products to grow more of.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            {
                conversationId: groupConvo3.id,
                senderId: seller1.id,
                content: 'Yes! The sales dashboard is really helpful. I noticed tomatoes and basil are my top sellers, so I\'m expanding those beds next season.',
                type: MessageType.TEXT,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            },
        ],
    })

    console.log('👥 Created groups')

    console.log('✅ Seed completed successfully!')
    console.log('\n📧 Test accounts (password: password123):')
    console.log('─'.repeat(50))
    console.log('Sellers:')
    console.log('  • john@greenvalleyfarm.com (Green Valley Farm)')
    console.log('  • sarah@sunnyacres.com (Sunny Acres)')
    console.log('  • mike@organicharvest.com (Organic Harvest)')
    console.log('\nBuyers:')
    console.log('  • customer@example.com (Jane Doe)')
    console.log('  • alex@email.com (Alex Thompson)')
    console.log('  • maria@email.com (Maria Garcia)')
    console.log('─'.repeat(50))
    console.log('\n📊 Seeded data:')
    console.log('  • 11 products with images')
    console.log('  • 5 orders (4 completed, 1 pending)')
    console.log('  • 8 product reviews')
    console.log('  • 3 direct chat conversations')
    console.log('  • 3 group conversations')
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
