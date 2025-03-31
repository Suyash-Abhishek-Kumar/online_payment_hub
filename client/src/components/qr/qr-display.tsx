import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { QrCode } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function QrDisplay() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: qrCode, isLoading } = useQuery<QrCode>({
    queryKey: ["/api/qr-code"],
  });
  
  const qrCodeUrl = qrCode 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode.qrString)}`
    : "";
  
  const handleDownload = () => {
    if (!qrCodeUrl) return;
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `payhub-qr-${user?.username || 'user'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been downloaded successfully",
    });
  };
  
  const handleShare = () => {
    if (navigator.share && qrCodeUrl) {
      navigator.share({
        title: 'My PayHub QR Code',
        text: 'Scan this QR code to pay me using PayHub',
        url: qrCodeUrl,
      }).then(() => {
        toast({
          title: "Shared Successfully",
          description: "Your QR code has been shared",
        });
      }).catch((error) => {
        toast({
          title: "Share failed",
          description: "Unable to share QR code: " + error,
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Coming Soon",
        description: "Additional sharing options will be available soon",
      });
    }
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col items-center">
        <h2 className="text-lg font-medium text-gray-900 mb-6 w-full">Your Payment QR Code</h2>
        
        <div className="bg-white p-4 rounded-lg shadow mb-4 w-full max-w-[220px] h-[220px] flex items-center justify-center">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 w-full h-full"></div>
          ) : qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Your QR Code" className="w-full h-full"/>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">QR code not available</p>
            </div>
          )}
        </div>
        
        <p className="text-gray-500 text-sm text-center mb-6">Share this QR code to receive payments from other PayHub users</p>
        
        <div className="grid grid-cols-2 gap-4 w-full">
          <Button 
            className="flex items-center justify-center"
            onClick={handleDownload}
            disabled={isLoading || !qrCodeUrl}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center border-primary text-primary hover:bg-blue-50"
            onClick={handleShare}
            disabled={isLoading || !qrCodeUrl}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
