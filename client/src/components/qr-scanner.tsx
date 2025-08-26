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

    const initScanner = async () => {
      setIsInitializing(true);
      setError(null);
      setDebugInfo('بدء فحص الكاميرا...');
      
      try {
        // Check if we're in a secure context (allow Replit domains)
        const isReplit = window.location.hostname.includes('replit') || 
                        window.location.hostname.includes('repl.co') || 
                        window.location.hostname.includes('repl.it');
        const isLocalhost = window.location.hostname.includes('localhost') || 
                           window.location.hostname === '127.0.0.1';
        
        if (!window.isSecureContext && 
            window.location.protocol === 'http:' && 
            !isLocalhost && !isReplit) {
          setError('يتطلب ماسح الكيو آر كود اتصال آمن (HTTPS)');
          setDebugInfo('غير آمن: يتطلب HTTPS');
          setIsInitializing(false);
          return;
        }

        setDebugInfo('فحص توفر الكاميرا...');
        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setError('لم يتم العثور على كاميرا في الجهاز');
          setDebugInfo('لا توجد كاميرا متاحة');
          setIsInitializing(false);
          return;
        }
        setDebugInfo('تم العثور على كاميرا');

        // Request camera permissions explicitly
        try {
          // Check if mediaDevices is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('المتصفح لا يدعم الوصول للكاميرا');
            return;
          }

          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280, min: 320 },
              height: { ideal: 720, min: 240 }
            } 
          });
          
          setDebugInfo('تم الحصول على تدفق الكاميرا');
          
          // Test the stream briefly
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;
            
            try {
              await videoRef.current.play();
              setDebugInfo('نجح تشغيل الفيديو');
              
              // Give time for video to load
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (playError) {
              console.error('Video play error:', playError);
              setDebugInfo('خطأ في تشغيل الفيديو');
            }
            
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
            if (videoRef.current) {
              videoRef.current.srcObject = null;
            }
          }
        } catch (permError: any) {
          console.error('Camera permission error:', permError);
          let errorMessage = 'يرجى السماح بالوصول للكاميرا في إعدادات المتصفح';
          
          // Check if it's HTTPS issue
          if (window.location.protocol === 'http:' && 
              window.location.hostname !== 'localhost' && 
              !window.location.hostname.includes('replit') && 
              !window.location.hostname.includes('repl.co') && 
              !window.location.hostname.includes('repl.it')) {
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

        setDebugInfo('إنشاء ماسح الكيو آر كود...');
        
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
            maxScansPerSecond: 3,
            returnDetailedScanResult: true,
            calculateScanRegion: (video) => {
              const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
              const scanRegionSize = Math.round(0.8 * smallestDimension);
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
        setDebugInfo('بدء تشغيل الماسح...');
        
        // Start the scanner
        try {
          await qrScanner.start();
          setHasPermission(true);
          setError(null);
          setDebugInfo('الماسح يعمل بنجاح');
          console.log('QR Scanner started successfully');
          
          // Ensure video is properly configured
          if (videoRef.current) {
            videoRef.current.style.display = 'block';
            videoRef.current.style.width = '100%';
            videoRef.current.style.height = '100%';
            videoRef.current.style.objectFit = 'cover';
            
            // Wait a bit for the video to fully load
            setTimeout(() => {
              if (videoRef.current && videoRef.current.videoWidth > 0) {
                setDebugInfo('الكاميرا تعمل');
              }
            }, 1000);
          }
        } catch (startError: any) {
          console.error('Failed to start QR scanner:', startError);
          setError(`فشل في تشغيل الماسح: ${startError.message || 'خطأ غير معروف'}`);
          setDebugInfo(`خطأ في التشغيل: ${startError.message || startError.name || 'غير معروف'}`);
        } finally {
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error('QR Scanner error:', err);
        setError(`فشل في تهيئة الماسح: ${err.message || 'خطأ غير معروف'}`);
        setDebugInfo(`خطأ عام: ${err.message || err.name || 'غير معروف'}`);
        setHasPermission(false);
      } finally {
        setIsInitializing(false);
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
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              {debugInfo && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 opacity-75">
                  معلومات التشخيص: {debugInfo}
                </p>
              )}
              <div className="mt-3 space-y-2">
                <Button
                  onClick={() => {
                    setError(null);
                    setHasPermission(null);
                    setDebugInfo('إعادة تشغيل الماسح...');
                    setIsInitializing(true);
                    
                    // Clean up current scanner
                    if (scanner) {
                      scanner.stop();
                      scanner.destroy();
                      setScanner(null);
                    }
                    
                    // Clear video
                    if (videoRef.current) {
                      videoRef.current.srcObject = null;
                    }
                    
                    // Force re-initialization
                    setTimeout(() => {
                      if (videoRef.current && isOpen) {
                        // This will trigger the useEffect again
                        window.location.reload();
                      }
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
            <div className="relative">
              <video
                ref={videoRef}
                className={cn(
                  "w-full aspect-square object-cover rounded-2xl bg-gray-800",
                  hasPermission === false && "hidden"
                )}
                playsInline
                muted
                autoPlay
                style={{ 
                  backgroundColor: '#1f2937',
                  minHeight: '300px',
                  maxHeight: '400px'
                }}
                onLoadedMetadata={() => {
                  console.log('Video metadata loaded');
                  if (videoRef.current) {
                    console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                  }
                }}
                onCanPlay={() => {
                  console.log('Video can play');
                  setDebugInfo('الفيديو جاهز للتشغيل');
                }}
                onError={(e) => {
                  console.error('Video error:', e);
                  setError('خطأ في عرض الفيديو');
                }}
              />
              
              {(hasPermission === null || isInitializing) && (
                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
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