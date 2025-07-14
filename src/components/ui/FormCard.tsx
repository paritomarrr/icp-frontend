import React from "react";

const FormCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white shadow-xl rounded-xl p-8 max-w-2xl w-full ${className}`}>
    {children}
  </div>
);

export default FormCard; 