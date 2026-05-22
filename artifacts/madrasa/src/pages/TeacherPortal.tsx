import { useState } from "react";
import { useLS, Student } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CalendarCheck, CheckSquare, GraduationCap } from "lucide-react";
import { Link } from "wouter";

export default function TeacherPortal() {
  const [students] = useLS<Student[]>("students", []);
  
  // Hardcoded for demo purposes since we don't have real auth user details
  const myClass = "Class 5";
  const myStudents = students.filter(s => s.className === myClass);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Teacher Portal</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here is your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Class</p>
                <h3 className="text-xl font-bold">{myClass}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Students</p>
                <h3 className="text-xl font-bold">{myStudents.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/attendance" className="block">
              <Button className="w-full justify-start h-12 text-lg" variant="outline">
                <CalendarCheck className="w-5 h-5 mr-3" /> Mark Daily Attendance
              </Button>
            </Link>
            <Link href="/hifz-progress" className="block">
              <Button className="w-full justify-start h-12 text-lg" variant="outline">
                <CheckSquare className="w-5 h-5 mr-3" /> Update Hifz Progress
              </Button>
            </Link>
            <Link href="/results" className="block">
              <Button className="w-full justify-start h-12 text-lg" variant="outline">
                <BookOpen className="w-5 h-5 mr-3" /> Add Exam Results
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Students List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myStudents.map(student => (
                <div key={student.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                  <span className="font-medium">{student.name}</span>
                  <span className="text-sm text-muted-foreground">{student.phone}</span>
                </div>
              ))}
              {myStudents.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No students assigned.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
