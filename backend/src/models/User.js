const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' }, // e.g. "Home", "Office"
    city: { type: String, default: 'Buea' },
    neighborhood: { type: String, required: true }, // e.g. Molyko, Mile 16
    address: { type: String, required: true }, // free text street/description
    landmark: { type: String, default: '' },
    phone: { type: String, required: true },
    deliveryInstructions: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: function () {
        // Guest checkout orders may create lightweight users without email
        return this.role !== 'guest';
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, trim: true },
    password: {
      type: String,
      required: function () {
        return this.role !== 'guest';
      },
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin', 'guest'],
      default: 'customer',
    },
    avatar: { type: String, default: '' },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    preferredLanguage: { type: String, enum: ['en', 'fr'], default: 'en' },
    isActive: { type: Boolean, default: true },

    // Seller-specific fields (used only when role === 'seller')
    sellerProfile: {
      shopName: { type: String, default: '' },
      isApproved: { type: Boolean, default: false },
      description: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
