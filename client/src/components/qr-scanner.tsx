import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X, Camera, Keyboard } from 'lucide-react';
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
  const [isInitializing, setIsInitializing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const initDirectCamera = async () => {
      setIsInitializing(true);
      setError(null);
      setDebugInfo('بدء تشغيل الكاميرا مباشرة...');
      
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('المتصفح لا يدعم الوصول للكاميرا');
          setIsInitializing(false);
          return;
        }

        setDebugInfo('طلب إذن الكاميرا...');
        
        // Get camera stream directly
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        });

        setDebugInfo('تم الحصول على تدفق الكاميرا');

        if (videoRef.current) {
          // Set the stream to video element
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.autoplay = true;
          
          // Force all style properties
          videoRef.current.style.display = 'block';
          videoRef.current.style.visibility = 'visible';
          videoRef.current.style.opacity = '1';
          videoRef.current.style.width = '100%';
          videoRef.current.style.height = '100%';
          videoRef.current.style.objectFit = 'cover';
          videoRef.current.style.backgroundColor = 'transparent';
          videoRef.current.style.position = 'absolute';
          videoRef.current.style.top = '0';
          videoRef.current.style.left = '0';
          videoRef.current.style.zIndex = '1';

          try {
            await videoRef.current.play();
            setDebugInfo('الكاميرا تعمل مباشرة');
            setHasPermission(true);
            setIsInitializing(false); // إخفاء overlay التحميل فوراً
            console.log('Direct camera started successfully');

            // Now create QR scanner on the working video
            setTimeout(async () => {
              try {
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
                    maxScansPerSecond: 3,
                    returnDetailedScanResult: true,
                  }
                );

                setScanner(qrScanner);
                await qrScanner.start();
                setDebugInfo('ماسح الكيو آر كود نشط');
                console.log('QR Scanner overlay started');
              } catch (scannerError) {
                console.warn('QR Scanner failed, but camera works:', scannerError);
                setDebugInfo('الكاميرا تعمل - ماسح الكيو آر كود متوقف');
              }
            }, 1000);

          } catch (playError) {
            console.error('Video play error:', playError);
            setError('فشل في تشغيل الفيديو');
          }
        }

      } catch (cameraError: any) {
        console.error('Camera access error:', cameraError);
        let errorMessage = 'فشل في الوصول للكاميرا';
        
        if (cameraError.name === 'NotAllowedError') {
          errorMessage = 'تم رفض الوصول للكاميرا. يرجى السماح بالوصول والمحاولة مرة أخرى';
        } else if (cameraError.name === 'NotFoundError') {
          errorMessage = 'لم يتم العثور على كاميرا متاحة في الجهاز';
        } else if (cameraError.name === 'NotReadableError') {
          errorMessage = 'الكاميرا قيد الاستخدام من تطبيق آخر';
        }
        
        setError(errorMessage);
        setDebugInfo(`خطأ: ${cameraError.name || cameraError.message}`);
      } finally {
        setIsInitializing(false);
      }
    };

    initDirectCamera();

    return () => {
      // Clean up camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      if (scanner) {
        try {
          scanner.stop();
          scanner.destroy();
        } catch (e) {
          console.warn('Error cleaning up scanner:', e);
        }
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
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              {debugInfo && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 opacity-75">
                  معلومات التشخيص: {debugInfo}
                </p>
              )}
              <div className="mt-3 space-y-2">
                <Button
                  onClick={() => {
                    // Clean up everything first
                    if (scanner) {
                      try {
                        scanner.stop();
                        scanner.destroy();
                      } catch (e) {
                        console.warn('Error stopping scanner:', e);
                      }
                      setScanner(null);
                    }
                    
                    // Clear video element
                    if (videoRef.current) {
                      videoRef.current.srcObject = null;
                      videoRef.current.style.display = 'none';
                    }
                    
                    // Reset all states
                    setError(null);
                    setHasPermission(null);
                    setDebugInfo('');
                    setIsInitializing(false);
                    
                    // Close and reopen dialog to trigger fresh initialization
                    onClose();
                    setTimeout(() => {
                      // This would need to be handled by parent component
                      console.log('Retry requested - please close and reopen scanner');
                    }, 100);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isInitializing}
                >
                  {isInitializing ? 'جاري المحاولة...' : 'إعادة المحاولة'}
                </Button>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>نصائح لحل المشكلة:</p>
                  <ul className="text-right list-disc list-inside space-y-1">
                    <li>تأكد من السماح بالوصول للكاميرا عند ظهور الطلب</li>
                    <li>تحقق من أن الكاميرا غير مستخدمة من تطبيق آخر</li>
                    <li>جرب إعادة تحميل الصفحة</li>
                  </ul>
                  <Button
                    onClick={() => setShowManualInput(true)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    إدخال الكود يدوياً
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showManualInput && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium text-blue-800 dark:text-blue-200">إدخال يدوي للكود</h3>
              </div>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="أدخل رقم المركبة أو محتوى الكيو آر كود"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="text-center"
                  dir="auto"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (manualCode.trim()) {
                        onScan(manualCode.trim());
                        onClose();
                      }
                    }}
                    disabled={!manualCode.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    تأكيد
                  </Button>
                  <Button
                    onClick={() => {
                      setShowManualInput(false);
                      setManualCode('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!error && (
            <div className="relative bg-black rounded-2xl overflow-hidden" style={{ minHeight: '300px', aspectRatio: '1' }}>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
                autoPlay
                style={{ 
                  display: hasPermission === false ? 'none' : 'block',
                  backgroundColor: 'transparent',
                  zIndex: 1
                }}
                onLoadedMetadata={() => {
                  console.log('Video metadata loaded');
                  if (videoRef.current) {
                    console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                    setDebugInfo(`أبعاد الفيديو: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
                    
                    // Force video to be visible
                    videoRef.current.style.display = 'block';
                    videoRef.current.style.opacity = '1';
                    videoRef.current.style.visibility = 'visible';
                  }
                }}
                onCanPlay={() => {
                  console.log('Video can play');
                  setDebugInfo('الفيديو جاهز للتشغيل');
                }}
                onPlaying={() => {
                  console.log('Video is playing');
                  setDebugInfo('الفيديو يعمل الآن');
                  
                  // Extra insurance that video is visible
                  if (videoRef.current) {
                    videoRef.current.style.display = 'block';
                    videoRef.current.style.opacity = '1';
                  }
                }}
                onError={(e) => {
                  console.error('Video error:', e);
                  setError('خطأ في عرض الفيديو');
                }}
              />
              
              {/* Loading overlay - only show when actually loading AND no permission yet */}
              {(hasPermission !== true && isInitializing) && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center" style={{ zIndex: 2 }}>
                  <div className="text-center space-y-3">
                    <div className="animate-pulse">
                      <Camera className="w-12 h-12 mx-auto text-blue-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                      {isInitializing ? 'جاري تهيئة الماسح...' : 'جاري تحضير الكاميرا...'}
                    </p>
                    {debugInfo && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {debugInfo}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">يرجى السماح بالوصول للكاميرا</p>
                  </div>
                </div>
              )}
              
              {/* Debug info when camera is working */}
              {hasPermission && debugInfo && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-2 rounded text-center" style={{ zIndex: 4 }}>
                  {debugInfo}
                </div>
              )}

              {/* Scanning guide overlay - only show when camera is working */}
              {hasPermission && !isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 3 }}>
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

          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            >
              إلغاء
            </Button>
            {!error && !showManualInput && (
              <Button
                onClick={() => setShowManualInput(true)}
                variant="outline"
                className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-700"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                إدخال يدوي
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}