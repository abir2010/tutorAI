"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mic, Send, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { handleTutorRequest } from "./actions";
import type { ReasonAboutHelpfulInformationOutput } from "@/ai/flows/reason-about-helpful-information";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  subject: z.string().min(1, { message: "Please select a subject." }),
  question: z.string().min(10, { message: "Please enter a question with at least 10 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function TutorPage() {
  const [isPending, startTransition] = useTransition();
  const [explanation, setExplanation] = useState<ReasonAboutHelpfulInformationOutput['explanation'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'english' | 'bangla'>('english');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      return;
    }
    
    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      form.setValue('question', transcript);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      question: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    setExplanation(null);
    startTransition(async () => {
      const result = await handleTutorRequest(values);
      if (result.success) {
        setExplanation(result.data.explanation);
      } else {
        setError(result.error);
      }
    });
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in your browser.");
        return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };


  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-primary" />
                <span>Ask TutorAI</span>
              </CardTitle>
              <CardDescription>Select a subject and ask your question to get a detailed explanation.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject to ask about" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="math">Mathematics</SelectItem>
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="web development">Web Development</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Question</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="e.g., 'What is the Pythagorean theorem?' or 'Explain recursion in Python.'"
                              className="resize-none pr-12"
                              rows={6}
                              {...field}
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className={`absolute top-1/2 -translate-y-1/2 right-2 transition-colors ${isListening ? 'text-accent' : 'text-muted-foreground'}`}
                              onClick={handleVoiceInput}
                              aria-label="Ask by voice"
                              disabled={!recognitionRef.current}
                            >
                              <Mic className="h-5 w-5" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> Get Explanation</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {(isPending || error || explanation) && (
            <Card className="mt-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Explanation</CardTitle>
                    {explanation && !isPending && (
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="language-toggle" className={language === 'english' ? 'text-foreground' : 'text-muted-foreground'}>English</Label>
                            <Switch
                                id="language-toggle"
                                checked={language === 'bangla'}
                                onCheckedChange={(checked) => setLanguage(checked ? 'bangla' : 'english')}
                                aria-label="Toggle language between English and Bangla"
                            />
                            <Label htmlFor="language-toggle" className={language === 'bangla' ? 'text-foreground' : 'text-muted-foreground'}>Bangla</Label>
                        </div>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                {isPending && <ExplanationSkeleton />}
                {error && <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>}
                {explanation && (
                  <div className="markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {language === 'english' ? explanation.english : explanation.bangla}
                    </ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}

const ExplanationSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <br />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/6" />
    </div>
);
