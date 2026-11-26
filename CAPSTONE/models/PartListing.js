const mongoose = require('mongoose');

const PART_CATEGORIES = [
  'RAM & Memory',
  'Storage (SSD/HDD)',
  'Processors (CPU)',
  'Graphics Cards (GPU)',
  'Motherboards & PCBs',
  'Displays & Screens',
  'Power Supplies & Adapters',
  'Battery Packs',
  'Cooling & Fans',
  'Other Salvage Parts',
];

const PART_CONDITIONS = [
  'Working / Tested',
  'Refurbishable',
  'For Parts / Scrap',
];

const PART_STATUSES = [
  'Available',
  'Sold',
  'Payout Settled',
  'Cancelled',
];

const partListingSchema = new mongoose.Schema(
  {
    numericId: {
      type: Number,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Part title is required'],
      trim: true,
      maxlength: 120,
    },
    partCategory: {
      type: String,
      required: [true, 'Part category is required'],
      enum: PART_CATEGORIES,
    },
    condition: {
      type: String,
      enum: PART_CONDITIONS,
      default: 'Working / Tested',
    },
    qty: {
      type: Number,
      default: 1,
      min: 1,
      max: 99,
    },
    priceInr: {
      type: Number,
      required: [true, 'Asking price in INR is required'],
      min: [10, 'Minimum price is ₹10'],
      max: [500000, 'Price cannot exceed ₹5,00,000'],
    },
    location: {
      type: String,
      required: [true, 'Pickup or hub location is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    sellerName: {
      type: String,
      required: true,
      trim: true,
    },
    sellerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sellerUpi: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: PART_STATUSES,
      default: 'Available',
      index: true,
    },
    buyerName: {
      type: String,
      default: '',
      trim: true,
    },
    buyerEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: '',
    },
    paidAmountInr: {
      type: Number,
      default: 0,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    payoutId: {
      type: String,
      default: '',
    },
    payoutAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.numericId || ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

partListingSchema.pre('save', function (next) {
  if (!this.numericId) {
    this.numericId = Date.now();
  }
  next();
});

const PartListing = mongoose.model('PartListing', partListingSchema);
PartListing.PART_CATEGORIES = PART_CATEGORIES;
PartListing.PART_CONDITIONS = PART_CONDITIONS;
PartListing.PART_STATUSES = PART_STATUSES;

module.exports = PartListing;
