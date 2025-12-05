'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getSuggestionsAction } from '@/actions/designSuggestions';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AiPanel() {
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    startTransition(async () => {
      if (!description.trim()) {
        toast({
          title: 'Input needed',
          description: 'Please describe your design idea to get suggestions.',
          variant: 'destructive',
        });
        return;
      }
      const result = await getSuggestionsAction({
        designDescription: description,
      });
      if (result.success && result.data) {
        setSuggestions(result.data.suggestions);
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          <span>AI Design Helper</span>
        </CardTitle>
        <CardDescription>
          Get trendy suggestions based on your idea.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="e.g., a retro-style sunset over a mountain range with a vintage car"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Get Suggestions'
            )}
          </Button>
        </form>
        {suggestions.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-primary">
              Here are some ideas:
            </h3>
            <ul className="space-y-2 list-disc list-inside bg-muted/50 p-4 rounded-lg border">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-foreground/80">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
