import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import QRCodeScanner from './qr-scanner';
import { useQuery } from '@tanstack/react-query';

interface QRScannerButtonProps {
  onVehicleFound: (vehicleId: number) => void;
  className?: string;
}

export default function QRScannerButton({ onVehicleFound, className }: QRScannerButtonProps) {
  const [isScanning, setIsScanning] = useState(false);
  
  const { data: inventoryItems } = useQuery({
    queryKey: ['/api/inventory'],
    enabled: false, // Only fetch when needed
  });

  const handleScan = async (result: string) => {
    try {
      // Parse the QR code result - it might contain vehicle information
      let vehicleId: number | null = null;
      
      // Try to parse as JSON first (in case QR contains structured data)
      try {
        const parsed = JSON.parse(result);
        if (parsed.vehicleId || parsed.id) {
          vehicleId = parsed.vehicleId || parsed.id;
        }
      } catch {
        // If not JSON, try to extract ID from URL or direct ID
        const idMatch = result.match(/vehicles\/(\d+)|vehicleId=(\d+)|id=(\d+)|\/(\d+)/) || result.match(/^\d+$/);
        if (idMatch) {
          vehicleId = parseInt(idMatch[1] || idMatch[2] || idMatch[3] || idMatch[4] || result);
        }
      }

      if (vehicleId) {
        // Instead of verifying, just navigate to the vehicle detail page
        window.location.href = `/vehicles/${vehicleId}`;
      } else {
        throw new Error('كود QR غير صالح');
      }
    } catch (error) {
      console.error('QR scan error:', error);
      // You might want to show a toast notification here
      alert(error instanceof Error ? error.message : 'فشل في قراءة الكود');
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsScanning(true)}
        variant="ghost"
        size="icon"
        className={className}
        title="مسح الكيو أر كود"
      >
        <QrCode className="w-5 h-5" />
      </Button>

      <QRCodeScanner
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScan={handleScan}
      />
    </>
  );
}