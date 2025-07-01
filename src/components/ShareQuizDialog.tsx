
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Share2, Loader2 } from 'lucide-react'

interface ShareQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTitle: string
  defaultDescription?: string
  organizationName: string
  isSharing: boolean
  onShare: (title: string, description: string) => void
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

  const handleShare = () => {
    onShare(title.trim(), description.trim())
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSharing) {
      // Reset form when closing
      setTitle(defaultTitle)
      setDescription(defaultDescription)
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
            Customize the quiz details before sharing with your organization. The quiz will be available for 1 hour and can only be taken once per member.
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
