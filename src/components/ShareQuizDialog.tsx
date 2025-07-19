
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Share2, Loader2, Clock, RefreshCw } from 'lucide-react'

interface ShareQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTitle: string
  defaultDescription?: string
  organizationName: string
  isSharing: boolean
  onShare: (title: string, description: string, attemptLimit: 'once' | 'multiple') => void
}

const ShareQuizDialog = ({
  open,
  onOpenChange,
  defaultTitle,
  defaultDescription = '',
  organizationName,
  isSharing,
  onShare
}: ShareQuizDialogProps) => {
  const [title, setTitle] = useState(defaultTitle)
  const [description, setDescription] = useState(defaultDescription)
  const [attemptLimit, setAttemptLimit] = useState<'once' | 'multiple'>('multiple')

  const handleShare = () => {
    onShare(title.trim(), description.trim(), attemptLimit)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSharing) {
      // Reset form when closing
      setTitle(defaultTitle)
      setDescription(defaultDescription)
      setAttemptLimit('multiple')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-2 border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-black">
            <Share2 className="h-5 w-5" />
            <span>Share Quiz with {organizationName}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Customize the quiz details and settings before sharing with your organization. The quiz will be available for 1 hour.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-black font-medium">Quiz Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title..."
              disabled={isSharing}
              className="border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-black font-medium">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description of the quiz..."
              className="min-h-[80px] resize-none border-gray-300 focus:border-black focus:ring-black"
              disabled={isSharing}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-black font-medium">Attempt Limit</Label>
            <RadioGroup 
              value={attemptLimit} 
              onValueChange={(value: 'once' | 'multiple') => setAttemptLimit(value)}
              disabled={isSharing}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="once" id="once" className="border-gray-400" />
                <div className="flex items-center space-x-2 flex-1">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <Label htmlFor="once" className="text-sm font-medium text-black cursor-pointer">
                      One time only
                    </Label>
                    <p className="text-xs text-gray-500">Members can take this quiz only once</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="multiple" id="multiple" className="border-gray-400" />
                <div className="flex items-center space-x-2 flex-1">
                  <RefreshCw className="h-4 w-4 text-gray-600" />
                  <div>
                    <Label htmlFor="multiple" className="text-sm font-medium text-black cursor-pointer">
                      Multiple attempts
                    </Label>
                    <p className="text-xs text-gray-500">Members can retake this quiz multiple times</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSharing}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleShare}
            disabled={isSharing || !title.trim()}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share Quiz
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ShareQuizDialog
