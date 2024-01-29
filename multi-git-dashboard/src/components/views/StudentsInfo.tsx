import { Button, Container, Modal, Table } from '@mantine/core';
import { Course } from '@shared/types/Course';
import { useState } from 'react';
import StudentForm from '../forms/StudentForm';
import CSVExport from '../csv/CSVExport';

interface StudentsInfoProps {
  course: Course;
  onUpdate: () => void;
}

const StudentsInfo: React.FC<StudentsInfoProps> = ({ course, onUpdate }) => {
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  const toggleForm = () => {
    setIsCreatingStudent(o => !o);
  };

  const handleStudentCreated = () => {
    setIsCreatingStudent(false);
    onUpdate();
  };

  const studentData = course.students.map(student => ({
    identifier: student.identifier,
    name: student.name,
    gitHandle: student.gitHandle,
    //email: student.email,
  }));

  const csvHeaders = ['identifier', 'name', 'gitHandle']; // 'email'];

  return (
    <Container>
      <Button
        onClick={toggleForm}
        style={{ marginTop: '16px', marginBottom: '16px' }}
      >
        Add Student
      </Button>
      <Modal
        opened={isCreatingStudent}
        onClose={toggleForm}
        title="Add Student"
      >
        <StudentForm
          courseId={course._id}
          onStudentCreated={handleStudentCreated}
        />
      </Modal>
      <CSVExport
        data={studentData}
        headers={csvHeaders}
        filename="students.csv"
      />
      <Table>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Name</th>
            <th style={{ textAlign: 'left' }}>ID</th>
            <th style={{ textAlign: 'left' }}>Git Handle</th>
          </tr>
        </thead>
        <tbody>
          {course.students.map(student => (
            <tr key={student._id}>
              <td style={{ textAlign: 'left' }}>{student.name}</td>
              <td style={{ textAlign: 'left' }}>{student.identifier}</td>
              <td style={{ textAlign: 'left' }}>{student.gitHandle}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default StudentsInfo;
