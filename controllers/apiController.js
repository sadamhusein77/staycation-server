const Item = require('../models/Item');
const Treasure = require('../models/Activity');
const Traveler = require('../models/Booking'); 
const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Booking = require('../models/Booking');
const Member = require('../models/Member');

module.exports = {
    landingPage: async (req, res) => {
        try {
            const mostPicked = await Item.find()
            .select('_id title country city price unit')
            .limit(5)
            .populate({ path: 'imageId', select: '_id imageUrl'})
            
            const category = await Category.find()
            .select('_id name')
            .limit(3)
            .populate({ 
                path: 'itemId', 
                select: '_id title country city isPopular imageId',
                perDocumentLimit: 4,
                option: { sort: { sumBooking: -1 } },
                populate: { 
                    path: 'imageId', 
                    select: '_id imageUrl',
                    perDocumentLimit: 1,
                }
            })

            const traveler = await Traveler.find();
            const treasure = await Treasure.find();
            const city = await Item.find();

            for (let i = 0; i < category.length; i++) {
                for (let j = 0; j < category[i].itemId.length; j++) {
                    const item = await Item.findOne({ _id: category[i].itemId[j]._id});
                    item.isPopular = false;
                    await item.save();
                    if(category[i].itemId[0] === category[i].itemId[j]) {
                        item.isPopular = true;
                        await item.save(); 
                    }
                }
            }

            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "images/testimonial2.jpg",
                name: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon ...",
                familyName: "Angga",
                familyOccupation: "Product Designer"
            }

            res.status(200).json({
                hero: {
                    travelers: traveler.length,
                    treasure: treasure.length,
                    cities: city.length,
                },
                mostPicked,
                category,
                testimonial
            })
        } catch (error) {
            console.log('Error', error);
            res.status(500).json({message: "Internal Server Error"});
        }
    },

    detailPage: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await Item.findOne({ _id: id })
            .populate({ path: 'featureId', select: '_id name qty imageUrl'})
            .populate({ path: 'activityId', select: '_id name type imageUrl'})
            .populate({ path: 'imageId', select: '_id imageUrl'});

            const bank = await Bank.find();
            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "images/testimonial1.jpg",
                name: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon ...",
                familyName: "Angga",
                familyOccupation: "Product Designer"
            }

            res.status(200).json({
                ...item._doc,
                bank,
                testimonial
            })
        } catch (error) {
            
        }
    },

    bookingPage: async (req, res) => {
        const {
            idItem,
            duration,
            bookingStartDate,
            bookingEndDate,
            firstName,
            lastName,
            email,
            phoneNumber,
            accountHolder,
            bankFrom,
          } = req.body;

          if(!req.file) {
            return res.status(401).json({ message: "image not found" });
          }

          const missingFields = Object.entries({
            idItem,
            duration,
            bookingStartDate,
            bookingEndDate,
            firstName,
            lastName,
            email,
            phoneNumber,
            accountHolder,
            bankFrom
          }).filter(([key, value]) => value === undefined || value === null || value === '');

          if (missingFields.length > 0) {
            return res.status(400).json({
              error: `Missing or empty fields: ${missingFields.map(([key]) => key).join(', ')}`
            });
        }

        const item = await Item.findOne({ _id: idItem });

        if(!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        item.sumBooking += 1;

        await item.save();

        let total = item.price * duration;
        let tax  = total * 0.10;

        const invoice = Math.floor(1000000 + Math.random() * 9000000);

        const member = await Member.create({
            firstName,
            lastName,
            email,
            phoneNumber
        })

        const newBooking = {
            invoice,
            bookingStartDate,
            bookingEndDate,
            total: total += tax,
            itemId: {
                _id: item.id,
                title: item.title,
                price: item.price,
                duration: duration
            },
            memberId: member.id,
            payments: {
                proofPayment: `images/${req.file.filename}`,
                bankFrom,
                accountHolder
            }
        }

        const booking = await Booking.create(newBooking);

        res.status(201).json({ message: "Success Booking", booking })
    }
}