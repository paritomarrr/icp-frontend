import React from "react";

interface FormRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormRow: React.FC<FormRowProps> = ({ label, description, children, className = "" }) => (
  <div className={`mb-6 ${className}`}>
    <label className="block font-semibold mb-1">{label}</label>
    {children}
    {description && <p className="text-gray-400 text-xs mt-1">{description}</p>}
  </div>
);

export default FormRow; 