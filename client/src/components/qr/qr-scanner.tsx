import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function QrScanner() {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  
  const handleScanNow = () => {
    setIsScanning(true);
    
    // Simulate scanner activation
    toast({
      title: "Scanner Activated",
      description: "Point your camera at a QR code to proceed",
    });
    
    // Simulate a timeout for demo purposes
    setTimeout(() => {
      setIsScanning(false);
      
      toast({
        title: "Coming Soon",
        description: "QR code scanning will be available soon",
      });
    }, 3000);
  };
  
  const handleUpload = () => {
    toast({
      title: "Coming Soon",
      description: "QR code upload functionality will be available soon",
    });
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col items-center">
        <h2 className="text-lg font-medium text-gray-900 mb-6 w-full">Scan QR to Pay</h2>
        
        <div className="w-full max-w-[220px] h-[220px] bg-gray-100 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
          {isScanning ? (
            <div className="text-center p-6 animate-pulse">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/50 flex items-center justify-center text-primary mb-3">
                <Camera className="h-8 w-8" />
              </div>
              <p className="font-medium text-gray-700">Scanning...</p>
              <p className="text-sm text-gray-500 mt-1">Hold steady</p>
            </div>
          ) : (
            <div className="text-center p-6">
              <div className="h-16 w-16 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-3">
                <Camera className="h-8 w-8" />
              </div>
              <p className="font-medium text-gray-700">Camera Preview</p>
              <p className="text-sm text-gray-500 mt-1">Point your camera at a QR code</p>
            </div>
          )}
        </div>
        
        <p className="text-gray-500 text-sm text-center mb-6">Scan the QR code to make instant payments</p>
        
        <div className="grid grid-cols-2 gap-4 w-full">
          <Button 
            className="flex items-center justify-center"
            onClick={handleScanNow}
            disabled={isScanning}
          >
            <Camera className="mr-2 h-4 w-4" />
            {isScanning ? "Scanning..." : "Scan Now"}
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center border-gray-300 text-gray-700"
            onClick={handleUpload}
          >
            <Image className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
