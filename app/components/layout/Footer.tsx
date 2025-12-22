"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, CreditCard, Truck, Shield, ArrowUp } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const tCategories = useTranslations("home.categories");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <ellipse cx="12" cy="9" rx="5" ry="6" />
                  <rect x="11" y="14" width="2" height="7" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold">Dinhan Store</span>
                <span className="block text-xs text-emerald-400">Badminton Pro Shop</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t("aboutDesc")}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#", color: "hover:bg-blue-600" },
                { icon: Instagram, href: "#", color: "hover:bg-pink-600" },
                { icon: Youtube, href: "#", color: "hover:bg-red-600" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center ${social.color} transition-colors`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">{t("quickLinks")}</h3>
            <ul className="space-y-3">
              {[
                { labelKey: "home", href: "/" },
                { labelKey: "products", href: "/products" },
                { labelKey: "about", href: "/about" },
                { labelKey: "contact", href: "/contact" },
                { labelKey: "warranty", href: "/warranty" },
                { labelKey: "returnPolicy", href: "/return-policy" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-6">{t("categories")}</h3>
            <ul className="space-y-3">
              {[
                { icon: "🏸", labelKey: "rackets", href: "/products?category=vot" },
                { icon: "👟", labelKey: "shoes", href: "/products?category=giay" },
                { icon: "👕", labelKey: "apparel", href: "/products?category=ao" },
                { icon: "🎒", labelKey: "bags", href: "/products?category=balo" },
                { icon: "🔧", labelKey: "accessories", href: "/products?category=phukien" },
                { icon: "⚙️", labelKey: "machines", href: "/products?category=may" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.icon} {tCategories(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6">{t("contact")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">234 Hoàng Quốc Việt, Cầu Giấy {"."} {" "} Hà Nội</p>
                  <p className="text-sm text-gray-400">TP. Hà Nội</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t("hotline")}</p>
                  <a href="tel:0901234567" className="font-semibold text-white hover:text-emerald-400 transition-colors">
                    0347 893 528
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t("email")}</p>
                  <a href="mailto:info@dinhanstore.com" className="font-semibold text-white hover:text-emerald-400 transition-colors">
                    info@dinhanstore.com
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: CreditCard, labelKey: "trustBadges.securePayment" },
              { icon: Truck, labelKey: "trustBadges.nationwide" },
              { icon: Shield, labelKey: "trustBadges.warranty" },
            ].map((badge, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-400">
                <badge.icon className="w-6 h-6 text-emerald-400" />
                <span className="text-sm font-medium">{t(badge.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              {t("copyright")}
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                {t("privacy")}
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                {t("terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center hover:shadow-2xl hover:shadow-emerald-500/40 transition-all z-40"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}
