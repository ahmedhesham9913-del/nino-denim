"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CustomerData {
  name: string;
  phone: string;
  address: string;
}

interface CustomerFormProps {
  initialData: CustomerData;
  onSubmit: (data: CustomerData) => void;
  onBack?: () => void;
}

const PHONE_REGEX = /^(\+20)?01[0125]\d{8}$/;

export default function CustomerForm({ initialData, onSubmit, onBack }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerData, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof CustomerData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!PHONE_REGEX.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid Egyptian phone number (e.g. 01012345678)";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });
    }
  }

  function handleChange(field: keyof CustomerData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Name */}
      <div>
        <label
          htmlFor="checkout-name"
          className="block font-[var(--font-display)] text-sm font-medium tracking-wide text-nino-950 mb-1.5"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="checkout-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter your full name"
          className={`
            w-full font-[var(--font-body)] text-sm text-nino-950 bg-white
            border rounded-xl px-4 py-3 outline-none transition-colors duration-200
            placeholder:text-nino-300
            ${errors.name ? "border-red-400 focus:border-red-500" : "border-nino-200/50 focus:border-nino-500"}
          `}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500 font-[var(--font-body)]">{errors.name}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="checkout-phone"
          className="block font-[var(--font-display)] text-sm font-medium tracking-wide text-nino-950 mb-1.5"
        >
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          id="checkout-phone"
          type="text"
          inputMode="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="01012345678"
          className={`
            w-full font-[var(--font-body)] text-sm text-nino-950 bg-white
            border rounded-xl px-4 py-3 outline-none transition-colors duration-200
            placeholder:text-nino-300
            ${errors.phone ? "border-red-400 focus:border-red-500" : "border-nino-200/50 focus:border-nino-500"}
          `}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500 font-[var(--font-body)]">{errors.phone}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor="checkout-address"
          className="block font-[var(--font-display)] text-sm font-medium tracking-wide text-nino-950 mb-1.5"
        >
          Delivery Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="checkout-address"
          rows={3}
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="Street address, building, floor, apartment"
          className={`
            w-full font-[var(--font-body)] text-sm text-nino-950 bg-white
            border rounded-xl px-4 py-3 outline-none transition-colors duration-200 resize-none
            placeholder:text-nino-300
            ${errors.address ? "border-red-400 focus:border-red-500" : "border-nino-200/50 focus:border-nino-500"}
          `}
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-500 font-[var(--font-body)]">{errors.address}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          className="w-full font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold text-white bg-nino-950 rounded-full py-3.5 hover:bg-nino-800 transition-colors duration-300"
        >
          CONTINUE
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold text-nino-500 hover:text-nino-950 transition-colors duration-300 py-2"
          >
            BACK
          </button>
        )}
      </div>
    </motion.form>
  );
}
