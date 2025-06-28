
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Key, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const ApiKeys = () => {
  const { user } = useUser()
  const { toast } = useToast()
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    gemini: false
  })
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    gemini: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load API keys from localStorage on component mount
    const savedKeys = {
      openai: localStorage.getItem('openai_api_key') || '',
      anthropic: localStorage.getItem('anthropic_api_key') || '',
      gemini: localStorage.getItem('gemini_api_key') || ''
    }
    setApiKeys(savedKeys)
  }, [])

  const handleSaveKey = (keyType: string, value: string) => {
    setIsLoading(true)
    try {
      localStorage.setItem(`${keyType}_api_key`, value)
      setApiKeys(prev => ({ ...prev, [keyType]: value }))
      toast({
        title: "API Key Saved",
        description: `Your ${keyType.toUpperCase()} API key has been saved securely.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShowKey = (keyType: string) => {
    setShowKeys(prev => ({ ...prev, [keyType]: !prev[keyType] }))
  }

  const maskKey = (key: string) => {
    if (!key) return ''
    return key.substring(0, 8) + '•'.repeat(Math.max(0, key.length - 12)) + key.substring(key.length - 4)
  }

  const apiKeyConfigs = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Required for GPT-powered quiz generation',
      placeholder: 'sk-...',
      helpUrl: 'https://platform.openai.com/api-keys'
    },
    {
      id: 'anthropic',
      name: 'Anthropic (Claude)',
      description: 'Alternative AI model for quiz generation',
      placeholder: 'sk-ant-...',
      helpUrl: 'https://console.anthropic.com/account/keys'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Google\'s AI model for quiz generation',
      placeholder: 'AI...',
      helpUrl: 'https://makersuite.google.com/app/apikey'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
        <p className="text-gray-600 mt-2">
          Manage your AI service API keys. These are stored locally in your browser for security.
        </p>
      </div>

      <div className="grid gap-6">
        {apiKeyConfigs.map((config) => (
          <Card key={config.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {config.name} API Key
              </CardTitle>
              <CardDescription>
                {config.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={config.id}>API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id={config.id}
                      type={showKeys[config.id] ? "text" : "password"}
                      placeholder={config.placeholder}
                      value={showKeys[config.id] ? apiKeys[config.id] : maskKey(apiKeys[config.id])}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, [config.id]: e.target.value }))}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleShowKey(config.id)}
                    >
                      {showKeys[config.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleSaveKey(config.id, apiKeys[config.id])}
                    disabled={isLoading || !apiKeys[config.id]}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Get your API key from{' '}
                <a
                  href={config.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {config.name}'s developer console
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Your API keys are stored locally in your browser and are never sent to our servers. 
            They are used directly to communicate with the AI services when generating quizzes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiKeys
