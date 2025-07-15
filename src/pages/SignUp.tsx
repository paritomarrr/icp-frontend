
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/ui/logo';
import { authService } from '@/lib/auth';
import { Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.signup(formData);
      toast({
        title: "Account created successfully!",
        description: "Welcome to ICP Wizard",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-octave-light-1 flex items-center justify-center p-4">
    <Card className="w-full max-w-md shadow-xl border border-octave-light-2 bg-white">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Logo size="2xl" />
        </div>
        <CardTitle className="text-2xl font-bold text-octave-dark-3">
          Create your ICP Wizard account
        </CardTitle>
        <CardDescription className="text-octave-dark-1">
          Start building better customer profiles today
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-octave-dark-2">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="border-octave-light-3 focus:border-octave-dark-2 focus:ring-0 text-octave-dark-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-octave-dark-2">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border-octave-light-3 focus:border-octave-dark-2 focus:ring-0 text-octave-dark-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-octave-dark-2">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border-octave-light-3 focus:border-octave-dark-2 focus:ring-0 text-octave-dark-2"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-octave-dark-2 hover:bg-octave-dark-3 text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <p className="text-sm text-center text-octave-dark-1">
            Already have an account?{' '}
            <Link to="/login" className="text-octave-dark-2 hover:text-octave-dark-3 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  </div>
  );
};

export default SignUp;
