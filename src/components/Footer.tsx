// import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-12 pb-8 px-6 md:px-12 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">YourHotel</h2>
          <p className="text-sm text-gray-400">
            A luxurious experience with comfort, peace, and joy. Make your stay unforgettable with us.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#"><FaFacebookF className="hover:text-white transition" /></a>
            <a href="#"><FaInstagram className="hover:text-white transition" /></a>
            <a href="#"><FaTwitter className="hover:text-white transition" /></a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Home</a></li>
            <li><a href="#" className="hover:text-white">Rooms</a></li>
            <li><a href="#" className="hover:text-white">Gallery</a></li>
            <li><a href="#" className="hover:text-white">Offers</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Information</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-white">FAQs</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="text-blue-400" />
              <span>+855 123 456 789</span>
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-blue-400" />
              <span>contact@yourhotel.com</span>
            </li>
            <li>
              #123 Hotel Street, Phnom Penh, Cambodia
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} YourHotel. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
