import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Database, 
  Cloud, 
  Shield, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Save,
  Play,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Upload,
  Download,
  Link,
  Server,
  Lock,
  Unlock
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'api' | 'database' | 'service' | 'storage';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  description: string;
  icon: any;
  config: any;
  lastTested?: Date;
  isRequired?: boolean;
}

const IntegrationManagement: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({});
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [showDatabaseConnection, setShowDatabaseConnection] = useState(false);
  const { toast } = useToast();

  // Load integrations data from API
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const response = await fetch('/api/integration/settings');
        if (response.ok) {
          const settings = await response.json();
          
          const integrationList: Integration[] = [
            {
              id: 'openai',
              name: 'OpenAI API',
              type: 'api',
              status: settings.openai.status,
              description: 'مساعد صوتي ذكي لإدارة المخزون باستخدام الذكاء الاصطناعي',
              icon: Zap,
              config: settings.openai,
              isRequired: true
            },
            {
              id: 'postgresql',
              name: 'PostgreSQL Database',
              type: 'database',
              status: settings.postgresql.status,
              description: 'قاعدة البيانات الرئيسية لتخزين بيانات المخزون',
              icon: Database,
              config: settings.postgresql,
              isRequired: true
            },
            {
              id: 'email',
              name: 'Email Service',
              type: 'service',
              status: settings.email.status,
              description: 'خدمة البريد الإلكتروني لإرسال الفواتير والعروض',
              icon: Mail,
              config: settings.email
            },
            {
              id: 'sms',
              name: 'SMS Service',
              type: 'service',
              status: settings.sms.status,
              description: 'خدمة الرسائل النصية لإشعارات العملاء',
              icon: MessageSquare,
              config: settings.sms
            },
            {
              id: 'cloud_storage',
              name: 'Cloud Storage',
              type: 'storage',
              status: settings.cloud_storage.status,
              description: 'تخزين سحابي للصور والمستندات',
              icon: Cloud,
              config: settings.cloud_storage
            },
            {
              id: 'payment',
              name: 'Payment Gateway',
              type: 'service',
              status: settings.payment.status,
              description: 'بوابة الدفع الإلكتروني',
              icon: Shield,
              config: settings.payment
            }
          ];

          setIntegrations(integrationList);
        }
      } catch (error) {
        console.error('Error loading integrations:', error);
        toast({
          title: "خطأ",
          description: "فشل في تحميل إعدادات التكامل",
          variant: "destructive",
        });
      }
    };

    fetchIntegrations();
  }, []);

  // Load database information
  useEffect(() => {
    const fetchDatabaseInfo = async () => {
      try {
        const response = await fetch('/api/integration/database/info');
        if (response.ok) {
          const dbInfo = await response.json();
          setDatabaseInfo(dbInfo);
        }
      } catch (error) {
        console.error('Error loading database info:', error);
      }
    };

    fetchDatabaseInfo();
  }, []);

  const testConnection = async (integrationId: string) => {
    setIsLoading(true);
    const integration = integrations.find(i => i.id === integrationId);
    
    if (!integration) return;

    // Update status to testing
    setIntegrations(prev => 
      prev.map(i => i.id === integrationId ? { ...i, status: 'testing' } : i)
    );

    try {
      const response = await fetch(`/api/integration/test/${integrationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: integration.config })
      });

      const result = await response.json();
      
      if (result.success) {
        setIntegrations(prev => 
          prev.map(i => i.id === integrationId ? 
            { ...i, status: 'connected', lastTested: new Date() } : i
          )
        );
        setTestResults(prev => ({
          ...prev,
          [integrationId]: result.message
        }));
        toast({
          title: "نجح الاختبار",
          description: result.message,
        });
      } else {
        setIntegrations(prev => 
          prev.map(i => i.id === integrationId ? 
            { ...i, status: 'error', lastTested: new Date() } : i
          )
        );
        setTestResults(prev => ({
          ...prev,
          [integrationId]: result.message
        }));
        toast({
          title: "فشل الاختبار",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setIntegrations(prev => 
        prev.map(i => i.id === integrationId ? 
          { ...i, status: 'error', lastTested: new Date() } : i
        )
      );
      setTestResults(prev => ({
        ...prev,
        [integrationId]: 'حدث خطأ أثناء اختبار الاتصال'
      }));
      toast({
        title: "خطأ في الاختبار",
        description: "حدث خطأ أثناء اختبار الاتصال",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveIntegration = (integrationId: string, config: any) => {
    setIntegrations(prev => 
      prev.map(i => i.id === integrationId ? { ...i, config } : i)
    );
    toast({
      title: "تم الحفظ",
      description: "تم حفظ إعدادات التكامل بنجاح",
    });
  };

  const toggleApiKeyVisibility = (integrationId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'testing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'متصل';
      case 'disconnected': return 'غير متصل';
      case 'error': return 'خطأ';
      case 'testing': return 'جاري الاختبار';
      default: return 'غير معروف';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <XCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'testing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const renderConfigForm = (integration: Integration) => {
    const IconComponent = integration.icon;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <IconComponent className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">{integration.name}</h3>
            <p className="text-sm text-gray-600">{integration.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          {integration.id === 'openai' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">مفتاح API</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type={showApiKeys[integration.id] ? 'text' : 'password'}
                    value={integration.config.apiKey}
                    onChange={(e) => {
                      const newConfig = { ...integration.config, apiKey: e.target.value };
                      saveIntegration(integration.id, newConfig);
                    }}
                    placeholder="sk-..."
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleApiKeyVisibility(integration.id)}
                  >
                    {showApiKeys[integration.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">النموذج</Label>
                  <Select value={integration.config.model} onValueChange={(value) => {
                    const newConfig = { ...integration.config, model: value };
                    saveIntegration(integration.id, newConfig);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">الحد الأقصى للرموز</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={integration.config.maxTokens}
                    onChange={(e) => {
                      const newConfig = { ...integration.config, maxTokens: parseInt(e.target.value) };
                      saveIntegration(integration.id, newConfig);
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {integration.id === 'postgresql' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">الخادم</Label>
                <Input
                  id="host"
                  value={integration.config.host}
                  onChange={(e) => {
                    const newConfig = { ...integration.config, host: e.target.value };
                    saveIntegration(integration.id, newConfig);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="port">المنفذ</Label>
                <Input
                  id="port"
                  value={integration.config.port}
                  onChange={(e) => {
                    const newConfig = { ...integration.config, port: e.target.value };
                    saveIntegration(integration.id, newConfig);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="database">قاعدة البيانات</Label>
                <Input
                  id="database"
                  value={integration.config.database}
                  onChange={(e) => {
                    const newConfig = { ...integration.config, database: e.target.value };
                    saveIntegration(integration.id, newConfig);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxConnections">الحد الأقصى للاتصالات</Label>
                <Input
                  id="maxConnections"
                  type="number"
                  value={integration.config.maxConnections}
                  onChange={(e) => {
                    const newConfig = { ...integration.config, maxConnections: parseInt(e.target.value) };
                    saveIntegration(integration.id, newConfig);
                  }}
                />
              </div>
            </div>
          )}

          {integration.id === 'email' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailHost">خادم البريد</Label>
                <Input
                  id="emailHost"
                  value={integration.config.host}
                  onChange={(e) => {
                    const newConfig = { ...integration.config, host: e.target.value };
                    saveIntegration(integration.id, newConfig);
                  }}
                  placeholder="smtp.gmail.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailPort">المنفذ</Label>
                  <Input
                    id="emailPort"
                    type="number"
                    value={integration.config.port}
                    onChange={(e) => {
                      const newConfig = { ...integration.config, port: parseInt(e.target.value) };
                      saveIntegration(integration.id, newConfig);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="encryption">التشفير</Label>
                  <Select value={integration.config.encryption} onValueChange={(value) => {
                    const newConfig = { ...integration.config, encryption: value };
                    saveIntegration(integration.id, newConfig);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">بدون تشفير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailUsername">اسم المستخدم</Label>
                <Input
                  id="emailUsername"
                  value={integration.config.username}
                  onChange={(e) => {
                    const newConfig = { ...integration.config, username: e.target.value };
                    saveIntegration(integration.id, newConfig);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailPassword">كلمة المرور</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={integration.config.password}
                  onChange={(e) => {
                    const newConfig = { ...integration.config, password: e.target.value };
                    saveIntegration(integration.id, newConfig);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => testConnection(integration.id)} disabled={isLoading}>
            <Play className="h-4 w-4 mr-2" />
            اختبار الاتصال
          </Button>
          
          <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
            إلغاء
          </Button>
        </div>

        {testResults[integration.id] && (
          <Alert className={integration.status === 'connected' ? 'border-green-200' : 'border-red-200'}>
            <AlertDescription>{testResults[integration.id]}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة التكامل</h1>
        <p className="text-gray-600">إدارة الاتصالات والتكامل مع الخدمات الخارجية</p>
      </div>

      {/* Database Connection Status */}
      {databaseInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">معلومات قاعدة البيانات الحالية</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">الخادم:</span>
              <span className="mr-2 font-mono">{databaseInfo.host}:{databaseInfo.port}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">قاعدة البيانات:</span>
              <span className="mr-2 font-mono">{databaseInfo.database}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">المستخدم:</span>
              <span className="mr-2 font-mono">{databaseInfo.username}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">SSL:</span>
              <span className="mr-2">{databaseInfo.ssl ? 'مفعل' : 'غير مفعل'}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-blue-700 dark:text-blue-300">سلسلة الاتصال:</span>
                <span className="mr-2 font-mono text-xs">{databaseInfo.connectionString}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDatabaseConnection(true)}
              >
                <Link className="h-4 w-4 mr-2" />
                ربط قاعدة بيانات خارجية
              </Button>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="databases">قواعد البيانات</TabsTrigger>
          <TabsTrigger value="services">الخدمات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-8 w-8 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                            <span className="text-sm text-gray-600">{getStatusText(integration.status)}</span>
                            {integration.isRequired && (
                              <Badge variant="secondary" className="text-xs">مطلوب</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {getStatusIcon(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                    
                    {integration.lastTested && (
                      <p className="text-xs text-gray-500 mb-3">
                        آخر اختبار: {integration.lastTested.toLocaleString('ar-SA')}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedIntegration(integration)}
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        إعدادات
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testConnection(integration.id)}
                        disabled={isLoading}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.filter(i => i.type === 'api').map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">الحالة:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                          <span className="text-sm">{getStatusText(integration.status)}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setSelectedIntegration(integration)}
                        className="w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        تكوين API
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="databases" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.filter(i => i.type === 'database').map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">الخادم:</span>
                          <p className="text-gray-600">{integration.config.host}</p>
                        </div>
                        <div>
                          <span className="font-medium">المنفذ:</span>
                          <p className="text-gray-600">{integration.config.port}</p>
                        </div>
                        <div>
                          <span className="font-medium">قاعدة البيانات:</span>
                          <p className="text-gray-600">{integration.config.database}</p>
                        </div>
                        <div>
                          <span className="font-medium">الحالة:</span>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                            <span>{getStatusText(integration.status)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setSelectedIntegration(integration)}
                        className="w-full"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        إدارة قاعدة البيانات
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.filter(i => i.type === 'service' || i.type === 'storage').map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">الحالة:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                          <span className="text-sm">{getStatusText(integration.status)}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setSelectedIntegration(integration)}
                        className="w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        تكوين الخدمة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">تكوين {selectedIntegration.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIntegration(null)}
              >
                ✕
              </Button>
            </div>
            
            {renderConfigForm(selectedIntegration)}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationManagement;