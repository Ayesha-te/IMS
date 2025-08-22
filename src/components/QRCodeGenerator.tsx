import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode-generator';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  level = 'M',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && value) {
      try {
        // Clear previous QR code
        containerRef.current.innerHTML = '';

        // Create QR code
        const qr = QRCode(0, level);
        qr.addData(value);
        qr.make();

        // Create image element
        const qrImage = document.createElement('div');
        qrImage.style.position = 'relative';
        qrImage.style.display = 'inline-block';
        qrImage.style.maxWidth = '100%';
        qrImage.style.maxHeight = '100%';
        
        qrImage.innerHTML = qr.createSvgTag({
          cellSize: size / qr.getModuleCount(),
          margin: 4,
          scalable: true
        });

        // Style the SVG
        const svg = qrImage.querySelector('svg');
        if (svg) {
          svg.style.width = `${size}px`;
          svg.style.height = `${size}px`;
          svg.style.border = '1px solid #e5e7eb';
          svg.style.borderRadius = '8px';
          svg.style.display = 'block';
          svg.style.margin = '0 auto';
          svg.style.position = 'static';
          svg.style.float = 'none';
        }

        containerRef.current.appendChild(qrImage);
      } catch (error) {
        console.error('Error generating QR code:', error);
        containerRef.current.innerHTML = '<div class="text-red-500">Error generating QR code</div>';
      }
    }
  }, [value, size, level]);

  if (!value) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg p-4 ${className}`} style={{ width: size, height: size }}>
        <span className="text-gray-500 text-sm">No QR data</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`} style={{ position: 'relative', overflow: 'visible' }}>
      <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }} />
    </div>
  );
};

export default QRCodeGenerator;