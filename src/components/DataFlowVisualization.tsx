import React, { useState } from 'react';
import { ArrowRight, FileSpreadsheet, Database, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

const DataFlowVisualization: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: "Excel Input",
      icon: FileSpreadsheet,
      color: "blue",
      description: "User enters human-readable data",
      data: {
        name: "Coca Cola 330ml",
        category: "Beverages",
        supplier: "Coca Cola Company",
        cost_price: 0.75,
        selling_price: 1.25,
        expiry_date: "2025-12-31"
      }
    },
    {
      id: 1,
      title: "System Processing",
      icon: Zap,
      color: "yellow",
      description: "Frontend converts names to IDs",
      data: {
        "categories.find()": "Beverages → ID: 1",
        "suppliers.find()": "Coca Cola Company → ID: 2", 
        "supermarkets[0]": "Auto-assign → ID: 1",
        "validation": "✅ All required fields present"
      }
    },
    {
      id: 2,
      title: "API Payload",
      icon: Database,
      color: "purple",
      description: "Backend receives proper format",
      data: {
        name: "Coca Cola 330ml",
        category: 1,
        supplier: 2,
        supermarket: 1,
        cost_price: 0.75,
        selling_price: 1.25,
        expiry_date: "2025-12-31",
        is_active: true
      }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-800", 
      purple: "bg-purple-50 border-purple-200 text-purple-800"
    };
    return colors[color as keyof typeof colors];
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      yellow: "text-yellow-600",
      purple: "text-purple-600"
    };
    return colors[color as keyof typeof colors];
  };

  // Hidden; this visualization has been removed from UI
  return null;
};

export default DataFlowVisualization;