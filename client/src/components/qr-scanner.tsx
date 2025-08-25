import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export default function QRCodeScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const initScanner = async () => {
      try {
        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setError('الكاميرا غير متوفرة');
          return;
        }

        // Request camera permissions explicitly
        try {
          // Check if mediaDevices is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('المتصفح لا يدعم الوصول للكاميرا');
            return;
          }

          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 }
            } 
          });
          
          // Test the stream first
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            
            // Give a moment to load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
          }
        } catch (permError: any) {
          console.error('Camera permission error:', permError);
          let errorMessage = 'يرجى السماح بالوصول للكاميرا في إعدادات المتصفح';
          
          // Check if it's HTTPS issue
          if (window.location.protocol === 'http:' && 
              window.location.hostname !== 'localhost' && 
              !window.location.hostname.includes('replit') && 
              !window.location.hostname.includes('repl.co')) {
            errorMessage = 'يتطلب الوصول للكاميرا اتصال آمن (HTTPS). يرجى استخدام الرابط الآمن أو localhost';
          } else if (permError.name === 'NotAllowedError') {
            errorMessage = 'تم رفض الوصول للكاميرا. يرجى السماح بالوصول في إعدادات المتصفح';
          } else if (permError.name === 'NotFoundError') {
            errorMessage = 'لم يتم العثور على كاميرا متاحة في الجهاز';
          } else if (permError.name === 'NotReadableError') {
            errorMessage = 'الكاميرا قيد الاستخدام من تطبيق آخر';
          }
          
          setError(errorMessage);
          return;
        }

        // Create scanner instance with improved settings
        const qrScanner = new QrScanner(
          videoRef.current!,
          (result) => {
            console.log('QR Code scanned:', result.data);
            onScan(result.data);
            onClose();
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
            maxScansPerSecond: 5,
            calculateScanRegion: (video) => {
              const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
              const scanRegionSize = Math.round(2/3 * smallestDimension);
              return {
                x: Math.round((video.videoWidth - scanRegionSize) / 2),
                y: Math.round((video.videoHeight - scanRegionSize) / 2),
                width: scanRegionSize,
                height: scanRegionSize,
              };
            },
          }
        );

        setScanner(qrScanner);
        
        // Add a small delay before starting
        setTimeout(async () => {
          try {
            await qrScanner.start();
            setHasPermission(true);
            setError(null);
            console.log('QR Scanner started successfully');
            
            // Ensure video is visible
            if (videoRef.current) {
              videoRef.current.style.display = 'block';
              videoRef.current.style.width = '100%';
              videoRef.current.style.height = '100%';
            }
          } catch (startError) {
            console.error('Failed to start QR scanner:', startError);
            setError('فشل في تشغيل الكاميرا. تأكد من منح الصلاحيات المناسبة.');
          }
        }, 500);
      } catch (err) {
        console.error('QR Scanner error:', err);
        setError('فشل في تشغيل الكاميرا. يرجى السماح بالوصول للكاميرا.');
        setHasPermission(false);
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.stop();
        scanner.destroy();
      }
    };
  }, [isOpen, onScan, onClose]);

  const handleClose = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }
    setError(null);
    setHasPermission(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
            <Camera className="w-6 h-6" />
            مسح الكيو أر كود
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <div className="mt-3 space-y-2">
                <Button
                  onClick={() => {
                    setError(null);
                    setHasPermission(null);
                    // Try to reinitialize scanner
                    if (scanner) {
                      scanner.stop();
                      scanner.destroy();
                      setScanner(null);
                    }
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  إعادة المحاولة
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  إذا استمرت المشكلة، تأكد من منح الصلاحيات في إعدادات المتصفح
                </p>
              </div>
            </div>
          )}

          {!error && (
            <div className="relative">
              <video
                ref={videoRef}
                className={cn(
                  "w-full aspect-square object-cover rounded-2xl",
                  hasPermission === false && "hidden"
                )}
                playsInline
                muted
                autoPlay
                style={{ 
                  backgroundColor: '#1f2937', // Better fallback color
                  minHeight: '300px'
                }}
              />
              
              {hasPermission === null && (
                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="animate-pulse">
                      <Camera className="w-12 h-12 mx-auto text-blue-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">جاري تحضير الكاميرا...</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">يرجى السماح بالوصول للكاميرا</p>
                  </div>
                </div>
              )}

              {/* Scanning guide overlay */}
              {hasPermission && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white rounded-2xl shadow-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasPermission && !error && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                وجه الكاميرا نحو الكيو أر كود لمسحه
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>الماسح نشط</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}