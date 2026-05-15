import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbulb, Code, Palette, Zap } from "lucide-react";

interface TipsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hints: string[];
}

export function TipsModal({ open, onOpenChange, hints }: TipsModalProps) {
  const getHintIcon = (index: number) => {
    const icons = [
      <Code className="w-4 h-4" />,
      <Palette className="w-4 h-4" />,
      <Zap className="w-4 h-4" />,
    ];
    return icons[index % icons.length];
  };

  const getHintColor = (index: number) => {
    const colors = [
      "border-blue-400 bg-blue-50",
      "border-green-400 bg-green-50", 
      "border-yellow-400 bg-yellow-50",
    ];
    return colors[index % colors.length];
  };

  const getHintTextColor = (index: number) => {
    const colors = [
      "text-blue-900",
      "text-green-900",
      "text-yellow-900",
    ];
    return colors[index % colors.length];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Lightbulb className="w-5 h-5 text-warning mr-2" />
            Dicas para este exercício
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm text-gray-700">
          {hints.map((hint, index) => (
            <div 
              key={index}
              className={`p-3 border-l-4 rounded ${getHintColor(index)}`}
            >
              <p className={`font-medium mb-1 flex items-center ${getHintTextColor(index)}`}>
                {getHintIcon(index)}
                <span className="ml-2">Dica {index + 1}</span>
              </p>
              <p>{hint}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90">
            Entendi!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}