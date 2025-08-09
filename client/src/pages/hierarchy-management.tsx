import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Settings, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VehicleSpecification {
  id: number;
  manufacturer: string;
  category: string;
  trimLevel: string;
  model: string;
  chassisNumber?: string;
  specifications: any;
  createdAt: string;
  updatedAt: string;
}

interface VehicleImageLink {
  id: number;
  manufacturer: string;
  category: string;
  trimLevel: string;
  exteriorColor: string;
  interiorColor: string;
  chassisNumber?: string;
  imageUrls: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function HierarchyManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"specifications" | "images">("specifications");
  
  // Specifications states
  const [showSpecDialog, setShowSpecDialog] = useState(false);
  const [editingSpec, setEditingSpec] = useState<VehicleSpecification | null>(null);
  const [specForm, setSpecForm] = useState({
    manufacturer: "",
    category: "",
    trimLevel: "",
    model: "",
    chassisNumber: "",
    specifications: ""
  });

  // Image links states
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<VehicleImageLink | null>(null);
  const [imageForm, setImageForm] = useState({
    manufacturer: "",
    category: "",
    trimLevel: "",
    exteriorColor: "",
    interiorColor: "",
    chassisNumber: "",
    imageUrls: [""],
    description: ""
  });

  // Comprehensive data for dropdowns
  const manufacturers = [
    "تويوتا / Toyota",
    "مرسيدس / Mercedes-Benz", 
    "بي ام دبليو / BMW",
    "اودي / Audi",
    "لكزس / Lexus",
    "لاند روفر / Land Rover",
    "رولز رويس / Rolls-Royce",
    "بنتلي / Bentley",
    "فيراري / Ferrari",
    "بورش / Porsche",
    "لامبورجيني / Lamborghini",
    "تسلا / Tesla",
    "فورد / Ford",
    "جي إم سي / GMC",
    "شيفروليه / Chevrolet",
    "دودج / Dodge",
    "لينكولن / Lincoln",
    "نيسان / Nissan",
    "انفينيتي / Infiniti"
  ];

  const categoriesByManufacturer: Record<string, string[]> = {
    "تويوتا / Toyota": [
      "كامري / Camry", "كورولا / Corolla", "افالون / Avalon", "RAV4", 
      "هايلاندر / Highlander", "برادو / Prado", "لاند كروزر / Land Cruiser",
      "سيكويا / Sequoia", "تاكوما / Tacoma", "تندرا / Tundra", "سيينا / Sienna"
    ],
    "مرسيدس / Mercedes-Benz": [
      "E-Class", "C-Class", "S-Class", "A-Class", "CLS", "GLE", "GLS", 
      "GLC", "GLA", "G-Class", "AMG GT", "EQS", "EQE", "Sprinter", "V-Class"
    ],
    "بي ام دبليو / BMW": [
      "الفئة الثالثة / 3 Series", "الفئة الخامسة / 5 Series", "الفئة السابعة / 7 Series",
      "X1", "X3", "X5", "X7", "Z4", "i3", "i4", "iX", "M3", "M5", "X6"
    ],
    "لكزس / Lexus": [
      "ES", "IS", "GS", "LS", "RX", "GX", "LX", "NX", "UX", "LC", "RC"
    ],
    "لاند روفر / Land Rover": [
      "رينج روفر / Range Rover", "رينج روفر سبورت / Range Rover Sport",
      "رينج روفر إيفوك / Range Rover Evoque", "ديسكفري / Discovery",
      "ديفندر / Defender"
    ],
    "رولز رويس / Rolls-Royce": [
      "فانتوم / Phantom", "غوست / Ghost", "ريث / Wraith", "داون / Dawn", "كولينان / Cullinan"
    ],
    "بنتلي / Bentley": [
      "كونتيننتال / Continental", "فلاينج سبير / Flying Spur", "بنتايجا / Bentayga"
    ],
    "فيراري / Ferrari": [
      "488", "F8", "SF90", "Roma", "Portofino", "812", "LaFerrari"
    ],
    "بورش / Porsche": [
      "911", "Cayenne", "Macan", "Panamera", "Taycan", "718"
    ],
    "لامبورجيني / Lamborghini": [
      "أفينتادور / Aventador", "هوراكان / Huracan", "أوروس / Urus"
    ],
    "تسلا / Tesla": [
      "Model S", "Model 3", "Model X", "Model Y", "Cybertruck"
    ],
    "فورد / Ford": [
      "فيوجن / Fusion", "إكسبلورر / Explorer", "F-150", "موستانج / Mustang", "إسكيب / Escape"
    ],
    "جي إم سي / GMC": [
      "سييرا / Sierra", "أكاديا / Acadia", "تيرين / Terrain", "يوكون / Yukon"
    ],
    "شيفروليه / Chevrolet": [
      "تاهو / Tahoe", "سوبربان / Suburban", "إكوينوكس / Equinox", "كامارو / Camaro"
    ],
    "دودج / Dodge": [
      "تشالنجر / Challenger", "تشارجر / Charger", "دورانجو / Durango", "رام / RAM"
    ],
    "لينكولن / Lincoln": [
      "نافيجيتور / Navigator", "أفياتور / Aviator", "كورسير / Corsair", "MKZ"
    ],
    "نيسان / Nissan": [
      "ألتيما / Altima", "سنترا / Sentra", "باترول / Patrol", "أرمادا / Armada", "370Z"
    ],
    "انفينيتي / Infiniti": [
      "Q50", "Q60", "Q70", "QX50", "QX60", "QX80"
    ]
  };

  const trimLevels = [
    "فل كامل / Full Option",
    "فل / Full", 
    "ستاندرد / Standard",
    "بريميوم / Premium",
    "لوكس / Luxury",
    "سبورت / Sport",
    "AMG",
    "M Sport",
    "S-Line",
    "F Sport",
    "HSE",
    "Autobiography",
    "First Edition",
    "Black Edition"
  ];

  const models = ["2025", "2024", "2023", "2022", "2021", "2020"];

  const exteriorColors = [
    "أبيض / White",
    "أبيض لؤلؤي / Pearl White", 
    "أسود / Black",
    "أسود معدني / Metallic Black",
    "فضي / Silver",
    "رمادي / Gray",
    "رمادي معدني / Metallic Gray",
    "أزرق / Blue",
    "أزرق معدني / Metallic Blue",
    "أحمر / Red",
    "بني / Brown",
    "بيج / Beige",
    "ذهبي / Gold",
    "برونزي / Bronze",
    "أخضر / Green"
  ];

  const interiorColors = [
    "بيج / Beige",
    "أسود / Black", 
    "بني / Brown",
    "رمادي / Gray",
    "كريمي / Cream",
    "أبيض / White",
    "أحمر / Red",
    "أزرق / Blue"
  ];

  // Comprehensive default specifications data
  const defaultSpecs: VehicleSpecification[] = [
    // Toyota Specifications
    {
      id: 1,
      manufacturer: "تويوتا / Toyota",
      category: "كامري / Camry",
      trimLevel: "فل كامل / Full Option",
      model: "2024",
      specifications: {
        engine: "محرك 2.5 لتر 4 سلندر / 2.5L 4-Cylinder Engine",
        power: "203 حصان / 203 HP",
        transmission: "ناقل حركة أوتوماتيكي 8 سرعات / 8-Speed Automatic",
        fuelType: "بنزين / Gasoline",
        drivetrain: "دفع أمامي / Front-Wheel Drive",
        features: ["نظام الملاحة / Navigation", "كاميرا خلفية / Backup Camera", "حساسات وقوف / Parking Sensors", "مقاعد جلدية / Leather Seats"]
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      manufacturer: "تويوتا / Toyota",
      category: "لاند كروزر / Land Cruiser",
      trimLevel: "فل كامل / Full Option",
      model: "2024",
      specifications: {
        engine: "محرك 3.5 لتر V6 توين تيربو / 3.5L V6 Twin Turbo",
        power: "409 حصان / 409 HP",
        transmission: "ناقل حركة أوتوماتيكي 10 سرعات / 10-Speed Automatic",
        fuelType: "بنزين / Gasoline",
        drivetrain: "دفع رباعي / All-Wheel Drive",
        features: ["نظام الملاحة المتقدم / Advanced Navigation", "كاميرا 360 / 360 Camera", "مقاعد جلدية مدفأة / Heated Leather Seats", "سقف بانوراما / Panoramic Sunroof"]
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    // Mercedes Specifications
    {
      id: 3,
      manufacturer: "مرسيدس / Mercedes-Benz",
      category: "E-Class",
      trimLevel: "AMG",
      model: "2024",
      specifications: {
        engine: "محرك 3.0 لتر V6 توربو / 3.0L V6 Turbo",
        power: "429 حصان / 429 HP",
        transmission: "ناقل حركة أوتوماتيكي 9 سرعات / 9G-TRONIC",
        fuelType: "بنزين / Gasoline",
        drivetrain: "دفع رباعي / All-Wheel Drive",
        features: ["نظام MBUX المتطور / Advanced MBUX", "مقاعد AMG الرياضية / AMG Sport Seats", "نظام صوت Burmester / Burmester Sound", "إضاءة محيطية / Ambient Lighting"]
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    // BMW Specifications
    {
      id: 4,
      manufacturer: "بي ام دبليو / BMW",
      category: "الفئة الخامسة / 5 Series",
      trimLevel: "M Sport",
      model: "2024",
      specifications: {
        engine: "محرك 3.0 لتر 6 سلندر توربو / 3.0L I6 Turbo",
        power: "382 حصان / 382 HP",
        transmission: "ناقل حركة أوتوماتيكي 8 سرعات / 8-Speed Automatic",
        fuelType: "بنزين / Gasoline",
        drivetrain: "دفع خلفي / Rear-Wheel Drive",
        features: ["نظام iDrive 8 / iDrive 8", "مقاعد جلدية رياضية / Sport Leather Seats", "نظام صوت Harman Kardon / Harman Kardon Audio", "إضاءة ليزر / Laser Headlights"]
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    // Land Rover Specifications
    {
      id: 5,
      manufacturer: "لاند روفر / Land Rover",
      category: "رينج روفر / Range Rover",
      trimLevel: "Autobiography",
      model: "2024",
      specifications: {
        engine: "محرك 4.4 لتر V8 توين تيربو / 4.4L V8 Twin Turbo",
        power: "523 حصان / 523 HP",
        transmission: "ناقل حركة أوتوماتيكي 8 سرعات / 8-Speed Automatic",
        fuelType: "بنزين / Gasoline",
        drivetrain: "دفع رباعي / All-Wheel Drive",
        features: ["نظام التعليق الهوائي / Air Suspension", "مقاعد جلدية فاخرة / Luxury Leather Seats", "نظام الترفيه الخلفي / Rear Entertainment", "إضاءة محيطية / Ambient Lighting"]
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    // Rolls-Royce Specifications
    {
      id: 6,
      manufacturer: "رولز رويس / Rolls-Royce",
      category: "فانتوم / Phantom",
      trimLevel: "First Edition",
      model: "2024",
      specifications: {
        engine: "محرك 6.75 لتر V12 توين تيربو / 6.75L V12 Twin Turbo",
        power: "563 حصان / 563 HP",
        transmission: "ناقل حركة أوتوماتيكي 8 سرعات / 8-Speed Automatic",
        fuelType: "بنزين / Gasoline",
        drivetrain: "دفع خلفي / Rear-Wheel Drive",
        features: ["نظام العزل الصوتي المتقدم / Advanced Sound Isolation", "مقاعد جلدية مخصصة / Bespoke Leather Seats", "نظام النجوم في السقف / Starlight Headliner", "أبواب بإغلاق ناعم / Soft Close Doors"]
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    // Ferrari Specifications
    {
      id: 7,
      manufacturer: "فيراري / Ferrari",
      category: "F8",
      trimLevel: "فل كامل / Full Option",
      model: "2024",
      specifications: {
        engine: "محرك 3.9 لتر V8 توين تيربو / 3.9L V8 Twin Turbo",
        power: "710 حصان / 710 HP",
        transmission: "ناقل حركة أوتوماتيكي 7 سرعات / 7-Speed Dual Clutch",
        fuelType: "بنزين / Gasoline",
        drivetrain: "دفع خلفي / Rear-Wheel Drive",
        features: ["نظام التحكم في الجر المتقدم / Advanced Traction Control", "مقاعد رياضية من الكربون / Carbon Sport Seats", "نظام العادم الرياضي / Sport Exhaust System", "شاشة قيادة رقمية / Digital Driver Display"]
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    // Tesla Specifications
    {
      id: 8,
      manufacturer: "تسلا / Tesla",
      category: "Model S",
      trimLevel: "فل كامل / Full Option",
      model: "2024",
      specifications: {
        engine: "محرك كهربائي مزدوج / Dual Electric Motor",
        power: "1020 حصان / 1020 HP",
        transmission: "ناقل حركة أحادي السرعة / Single Speed",
        fuelType: "كهربائي / Electric",
        drivetrain: "دفع رباعي / All-Wheel Drive",
        features: ["نظام القيادة الذاتية الكاملة / Full Self-Driving", "شاشة لمس 17 بوصة / 17-inch Touchscreen", "نظام صوت عالي الجودة / Premium Audio System", "تحديثات البرمجيات عبر الإنترنت / Over-the-Air Updates"]
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    }
  ];

  // Comprehensive default image links
  const defaultImages: VehicleImageLink[] = [
    {
      id: 1,
      manufacturer: "تويوتا / Toyota",
      category: "كامري / Camry",
      trimLevel: "فل كامل / Full Option",
      exteriorColor: "أبيض لؤلؤي / Pearl White",
      interiorColor: "بيج / Beige",
      imageUrls: [
        "https://cdn.toyota.com/camry-2024-pearl-white-exterior-front.jpg",
        "https://cdn.toyota.com/camry-2024-pearl-white-exterior-side.jpg",
        "https://cdn.toyota.com/camry-2024-beige-interior.jpg"
      ],
      description: "صور تويوتا كامري 2024 فل كامل باللون الأبيض اللؤلؤي والداخلية البيج / Toyota Camry 2024 Full Option Pearl White with Beige Interior",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      manufacturer: "تويوتا / Toyota",
      category: "لاند كروزر / Land Cruiser",
      trimLevel: "فل كامل / Full Option",
      exteriorColor: "أسود معدني / Metallic Black",
      interiorColor: "بني / Brown",
      imageUrls: [
        "https://cdn.toyota.com/landcruiser-2024-black-exterior-front.jpg",
        "https://cdn.toyota.com/landcruiser-2024-black-exterior-side.jpg",
        "https://cdn.toyota.com/landcruiser-2024-brown-interior.jpg"
      ],
      description: "صور تويوتا لاند كروزر 2024 فل كامل باللون الأسود المعدني والداخلية البنية / Toyota Land Cruiser 2024 Full Option Metallic Black with Brown Interior",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 3,
      manufacturer: "مرسيدس / Mercedes-Benz",
      category: "E-Class",
      trimLevel: "AMG",
      exteriorColor: "فضي / Silver",
      interiorColor: "أسود / Black",
      imageUrls: [
        "https://cdn.mercedes.com/e-class-2024-silver-amg-exterior.jpg",
        "https://cdn.mercedes.com/e-class-2024-silver-amg-side.jpg",
        "https://cdn.mercedes.com/e-class-2024-black-amg-interior.jpg"
      ],
      description: "صور مرسيدس E-Class 2024 AMG باللون الفضي والداخلية السوداء / Mercedes E-Class 2024 AMG Silver with Black Interior",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 4,
      manufacturer: "بي ام دبليو / BMW",
      category: "الفئة الخامسة / 5 Series",
      trimLevel: "M Sport",
      exteriorColor: "أزرق معدني / Metallic Blue",
      interiorColor: "رمادي / Gray",
      imageUrls: [
        "https://cdn.bmw.com/5series-2024-blue-msport-exterior.jpg",
        "https://cdn.bmw.com/5series-2024-blue-msport-side.jpg",
        "https://cdn.bmw.com/5series-2024-gray-msport-interior.jpg"
      ],
      description: "صور بي ام دبليو الفئة الخامسة 2024 M Sport باللون الأزرق المعدني والداخلية الرمادية / BMW 5 Series 2024 M Sport Metallic Blue with Gray Interior",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 5,
      manufacturer: "لاند روفر / Land Rover",
      category: "رينج روفر / Range Rover",
      trimLevel: "Autobiography",
      exteriorColor: "أبيض لؤلؤي / Pearl White",
      interiorColor: "بني / Brown",
      imageUrls: [
        "https://cdn.landrover.com/range-rover-2024-white-autobiography-exterior.jpg",
        "https://cdn.landrover.com/range-rover-2024-white-autobiography-side.jpg",
        "https://cdn.landrover.com/range-rover-2024-brown-autobiography-interior.jpg"
      ],
      description: "صور لاند روفر رينج روفر 2024 Autobiography باللون الأبيض اللؤلؤي والداخلية البنية / Land Rover Range Rover 2024 Autobiography Pearl White with Brown Interior",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 6,
      manufacturer: "فيراري / Ferrari",
      category: "F8",
      trimLevel: "فل كامل / Full Option",
      exteriorColor: "أحمر / Red",
      interiorColor: "أسود / Black",
      imageUrls: [
        "https://cdn.ferrari.com/f8-2024-red-exterior-front.jpg",
        "https://cdn.ferrari.com/f8-2024-red-exterior-side.jpg",
        "https://cdn.ferrari.com/f8-2024-black-interior.jpg"
      ],
      description: "صور فيراري F8 2024 فل كامل باللون الأحمر والداخلية السوداء / Ferrari F8 2024 Full Option Red with Black Interior",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 7,
      manufacturer: "تسلا / Tesla",
      category: "Model S",
      trimLevel: "فل كامل / Full Option",
      exteriorColor: "أبيض / White",
      interiorColor: "أبيض / White",
      imageUrls: [
        "https://cdn.tesla.com/model-s-2024-white-exterior-front.jpg",
        "https://cdn.tesla.com/model-s-2024-white-exterior-side.jpg",
        "https://cdn.tesla.com/model-s-2024-white-interior.jpg"
      ],
      description: "صور تسلا Model S 2024 فل كامل باللون الأبيض والداخلية البيضاء / Tesla Model S 2024 Full Option White with White Interior",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 8,
      manufacturer: "بورش / Porsche",
      category: "911",
      trimLevel: "فل كامل / Full Option",
      exteriorColor: "رمادي معدني / Metallic Gray",
      interiorColor: "أسود / Black",
      imageUrls: [
        "https://cdn.porsche.com/911-2024-gray-exterior-front.jpg",
        "https://cdn.porsche.com/911-2024-gray-exterior-side.jpg",
        "https://cdn.porsche.com/911-2024-black-interior.jpg"
      ],
      description: "صور بورش 911 2024 فل كامل باللون الرمادي المعدني والداخلية السوداء / Porsche 911 2024 Full Option Metallic Gray with Black Interior",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    }
  ];

  // Handle specification form
  const handleSpecSubmit = () => {
    if (!specForm.manufacturer || !specForm.category || !specForm.trimLevel || !specForm.model) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      const specData = {
        ...specForm,
        specifications: JSON.parse(specForm.specifications || "{}")
      };
      
      toast({
        title: "تم بنجاح",
        description: editingSpec ? "تم تحديث المواصفات" : "تم إضافة المواصفات الجديدة",
      });
      
      setShowSpecDialog(false);
      setEditingSpec(null);
      setSpecForm({
        manufacturer: "",
        category: "",
        trimLevel: "",
        model: "",
        chassisNumber: "",
        specifications: ""
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "تأكد من صحة تنسيق JSON للمواصفات",
        variant: "destructive",
      });
    }
  };

  // Handle image link form
  const handleImageSubmit = () => {
    if (!imageForm.manufacturer || !imageForm.category || !imageForm.trimLevel || 
        !imageForm.exteriorColor || !imageForm.interiorColor) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const validUrls = imageForm.imageUrls.filter(url => url.trim() !== "");
    if (validUrls.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة رابط واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم بنجاح",
      description: editingImage ? "تم تحديث روابط الصور" : "تم إضافة روابط الصور الجديدة",
    });
    
    setShowImageDialog(false);
    setEditingImage(null);
    setImageForm({
      manufacturer: "",
      category: "",
      trimLevel: "",
      exteriorColor: "",
      interiorColor: "",
      chassisNumber: "",
      imageUrls: [""],
      description: ""
    });
  };

  // Add new image URL field
  const addImageUrlField = () => {
    setImageForm(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""]
    }));
  };

  // Remove image URL field
  const removeImageUrlField = (index: number) => {
    setImageForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  // Update image URL
  const updateImageUrl = (index: number, value: string) => {
    setImageForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, i) => i === index ? value : url)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">إدارة التسلسل الهرمي</h1>
          <p className="text-gray-300">إدارة المواصفات التفصيلية وروابط الصور للمركبات</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2 space-x-reverse bg-black/20 backdrop-blur-sm rounded-lg p-1">
            <Button
              onClick={() => setActiveTab("specifications")}
              variant={activeTab === "specifications" ? "default" : "ghost"}
              className={`px-6 py-2 ${
                activeTab === "specifications" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4 ml-2" />
              المواصفات التفصيلية
            </Button>
            <Button
              onClick={() => setActiveTab("images")}
              variant={activeTab === "images" ? "default" : "ghost"}
              className={`px-6 py-2 ${
                activeTab === "images" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <ImageIcon className="w-4 h-4 ml-2" />
              روابط الصور
            </Button>
          </div>
        </div>

        {/* Specifications Tab */}
        {activeTab === "specifications" && (
          <div className="space-y-6">
            {/* Add New Specification Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setShowSpecDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة مواصفات جديدة
              </Button>
            </div>

            {/* Specifications List */}
            <div className="grid gap-4">
              {defaultSpecs.map((spec: VehicleSpecification) => (
                <Card key={spec.id} className="glass-container">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="text-right">
                        <CardTitle className="text-white text-lg">
                          {spec.manufacturer} {spec.category} {spec.trimLevel}
                        </CardTitle>
                        <p className="text-gray-300 text-sm mt-1">
                          الموديل: {spec.model}
                          {spec.chassisNumber && ` • رقم الهيكل: ${spec.chassisNumber}`}
                        </p>
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSpec(spec);
                            setSpecForm({
                              manufacturer: spec.manufacturer,
                              category: spec.category,
                              trimLevel: spec.trimLevel,
                              model: spec.model,
                              chassisNumber: spec.chassisNumber || "",
                              specifications: JSON.stringify(spec.specifications, null, 2)
                            });
                            setShowSpecDialog(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/30 rounded-lg p-3 text-sm text-gray-300">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(spec.specifications, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Image Links Tab */}
        {activeTab === "images" && (
          <div className="space-y-6">
            {/* Add New Image Link Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setShowImageDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة روابط صور جديدة
              </Button>
            </div>

            {/* Image Links List */}
            <div className="grid gap-4">
              {defaultImages.map((imageLink: VehicleImageLink) => (
                <Card key={imageLink.id} className="glass-container">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="text-right">
                        <CardTitle className="text-white text-lg">
                          {imageLink.manufacturer} {imageLink.category} {imageLink.trimLevel}
                        </CardTitle>
                        <p className="text-gray-300 text-sm mt-1">
                          خارجي: {imageLink.exteriorColor} • داخلي: {imageLink.interiorColor}
                          {imageLink.chassisNumber && ` • رقم الهيكل: ${imageLink.chassisNumber}`}
                        </p>
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingImage(imageLink);
                            setImageForm({
                              manufacturer: imageLink.manufacturer,
                              category: imageLink.category,
                              trimLevel: imageLink.trimLevel,
                              exteriorColor: imageLink.exteriorColor,
                              interiorColor: imageLink.interiorColor,
                              chassisNumber: imageLink.chassisNumber || "",
                              imageUrls: imageLink.imageUrls,
                              description: imageLink.description || ""
                            });
                            setShowImageDialog(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {imageLink.description && (
                        <p className="text-gray-300 text-sm">{imageLink.description}</p>
                      )}
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-2">روابط الصور ({imageLink.imageUrls.length}):</p>
                        {imageLink.imageUrls.map((url, index) => (
                          <p key={index} className="text-blue-300 text-sm break-all">
                            {index + 1}. {url}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Specifications Dialog */}
        <Dialog open={showSpecDialog} onOpenChange={setShowSpecDialog}>
          <DialogContent className="glass-container max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-right">
                {editingSpec ? "تعديل المواصفات التفصيلية" : "إضافة مواصفات تفصيلية جديدة"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">الصانع *</Label>
                  <Select 
                    value={specForm.manufacturer} 
                    onValueChange={(value) => setSpecForm(prev => ({ ...prev, manufacturer: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="اختر الصانع" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">الفئة *</Label>
                  <Select 
                    value={specForm.category} 
                    onValueChange={(value) => setSpecForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {(specForm.manufacturer && categoriesByManufacturer[specForm.manufacturer] || []).map((category: string) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">درجة التجهيز *</Label>
                  <Select 
                    value={specForm.trimLevel} 
                    onValueChange={(value) => setSpecForm(prev => ({ ...prev, trimLevel: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="اختر درجة التجهيز" />
                    </SelectTrigger>
                    <SelectContent>
                      {trimLevels.map((trimLevel) => (
                        <SelectItem key={trimLevel} value={trimLevel}>
                          {trimLevel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">الموديل *</Label>
                  <Select 
                    value={specForm.model} 
                    onValueChange={(value) => setSpecForm(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="اختر الموديل" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">رقم الهيكل (اختياري)</Label>
                <Input
                  value={specForm.chassisNumber}
                  onChange={(e) => setSpecForm(prev => ({ ...prev, chassisNumber: e.target.value }))}
                  placeholder="أدخل رقم الهيكل للربط بسيارة محددة"
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">المواصفات التفصيلية (JSON) *</Label>
                <Textarea
                  value={specForm.specifications}
                  onChange={(e) => setSpecForm(prev => ({ ...prev, specifications: e.target.value }))}
                  placeholder={`{
  "engine": "محرك 2.5 لتر 4 سلندر",
  "power": "203 حصان",
  "transmission": "ناقل حركة أوتوماتيكي 8 سرعات",
  "fuelType": "بنزين",
  "features": ["نظام الملاحة", "كاميرا خلفية"]
}`}
                  className="glass-input min-h-[200px] font-mono text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button
                  onClick={() => setShowSpecDialog(false)}
                  variant="ghost"
                  className="text-gray-300"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSpecSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingSpec ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Links Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="glass-container max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-right">
                {editingImage ? "تعديل روابط الصور" : "إضافة روابط صور جديدة"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">الصانع *</Label>
                  <Select 
                    value={imageForm.manufacturer} 
                    onValueChange={(value) => setImageForm(prev => ({ ...prev, manufacturer: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="اختر الصانع" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">الفئة *</Label>
                  <Select 
                    value={imageForm.category} 
                    onValueChange={(value) => setImageForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {(imageForm.manufacturer && categoriesByManufacturer[imageForm.manufacturer] || []).map((category: string) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">درجة التجهيز *</Label>
                  <Select 
                    value={imageForm.trimLevel} 
                    onValueChange={(value) => setImageForm(prev => ({ ...prev, trimLevel: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="اختر درجة التجهيز" />
                    </SelectTrigger>
                    <SelectContent>
                      {trimLevels.map((trimLevel) => (
                        <SelectItem key={trimLevel} value={trimLevel}>
                          {trimLevel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">اللون الخارجي *</Label>
                  <Select 
                    value={imageForm.exteriorColor} 
                    onValueChange={(value) => setImageForm(prev => ({ ...prev, exteriorColor: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="اختر اللون الخارجي" />
                    </SelectTrigger>
                    <SelectContent>
                      {exteriorColors.map((color: string) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">اللون الداخلي *</Label>
                  <Select 
                    value={imageForm.interiorColor} 
                    onValueChange={(value) => setImageForm(prev => ({ ...prev, interiorColor: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="اختر اللون الداخلي" />
                    </SelectTrigger>
                    <SelectContent>
                      {interiorColors.map((color: string) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">رقم الهيكل (اختياري)</Label>
                <Input
                  value={imageForm.chassisNumber}
                  onChange={(e) => setImageForm(prev => ({ ...prev, chassisNumber: e.target.value }))}
                  placeholder="أدخل رقم الهيكل للربط بسيارة محددة"
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">الوصف (اختياري)</Label>
                <Input
                  value={imageForm.description}
                  onChange={(e) => setImageForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مختصر للصور"
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">روابط الصور *</Label>
                {imageForm.imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      placeholder={`رابط الصورة ${index + 1}`}
                      className="glass-input flex-1"
                    />
                    {imageForm.imageUrls.length > 1 && (
                      <Button
                        onClick={() => removeImageUrlField(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  onClick={addImageUrlField}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة رابط آخر
                </Button>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button
                  onClick={() => setShowImageDialog(false)}
                  variant="ghost"
                  className="text-gray-300"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleImageSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {editingImage ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}