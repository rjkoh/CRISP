import React, { useState } from 'react';
import { Course, TeamSet } from '@/types/course';
import TeamCard from '../cards/TeamCard';
import { Container, Tabs, Button, Group } from '@mantine/core';
import TeamSetForm from '../forms/TeamSetForm';
import StudentTeamForm from '../forms/StudentTeamForm';
import TATeamForm from '../forms/TATeamForm';

interface TeamsInfoProps {
  course: Course;
  onUpdate: () => void;
}

const backendPort = process.env.BACKEND_PORT || 3001;

const TeamsInfo: React.FC<TeamsInfoProps> = ({ course, onUpdate }) => {
  const [isCreatingTeamSet, setIsCreatingTeamSet] = useState<boolean>(false);
  const [isAddingStudents, setIsAddingStudents] = useState<boolean>(false);
  const [isAddingTAs, setIsAddingTAs] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [teamSetId, setTeamSetId] = useState<string | null>(null);

  const teamCards = (teamSet: TeamSet) =>
    teamSet.teams.map(team => (
      <TeamCard
        key={team._id}
        teamId={team._id}
        number={team.number}
        TA={team.TA}
        TAs={course.TAs}
        members={team.members}
        onTeamDeleted={onUpdate}
      />
    ));

  const headers = course.teamSets.map(teamSet => (
    <Tabs.Tab
      key={teamSet._id}
      value={teamSet.name}
      onClick={() => {
        setActiveTab(teamSet.name);
        setTeamSetId(teamSet._id);
      }}
    >
      {teamSet.name}
    </Tabs.Tab>
  ));

  const panels = course.teamSets.map(teamSet => (
    <Tabs.Panel key={teamSet._id} value={teamSet.name}>
      {teamCards(teamSet)}
    </Tabs.Panel>
  ));

  const handleTeamSetCreated = () => {
    setIsCreatingTeamSet(false);
    onUpdate();
  };

  const handleAddStudentsUploaded = () => {
    setIsAddingStudents(false);
    onUpdate();
  };

  const handleAddTAsUploaded = () => {
    setIsAddingTAs(false);
    onUpdate();
  };

  const handleDeleteTeamSet = async () => {
    try {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_DOMAIN}:${backendPort}/api/teamsets/${teamSetId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete the TeamSet');
      }

      onUpdate();
    } catch (error) {
      console.error('Error deleting TeamSet:', error);
    }
  };

  return (
    <Container>
      <Tabs value={activeTab}>
        <Tabs.List style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          {headers}
        </Tabs.List>
        {panels}
      </Tabs>

      <Group style={{ marginBottom: '16px', marginTop: '16px' }}>
        <Group>
          <Button onClick={() => setIsCreatingTeamSet(!isCreatingTeamSet)}>
            {isCreatingTeamSet ? 'Cancel' : 'Create TeamSet'}
          </Button>
          {activeTab && (
            <Button onClick={() => setIsAddingStudents(!isAddingStudents)}>
              {isAddingStudents ? 'Cancel' : 'Add Students'}
            </Button>
          )}
          {activeTab && (
            <Button onClick={() => setIsAddingTAs(!isAddingTAs)}>
              {isAddingTAs ? 'Cancel' : 'Add TAs'}
            </Button>
          )}
        </Group>

        {teamSetId && (
          <Button color="red" onClick={handleDeleteTeamSet}>
            Delete TeamSet
          </Button>
        )}
      </Group>

      {isCreatingTeamSet && (
        <TeamSetForm
          courseId={course._id}
          onTeamSetCreated={handleTeamSetCreated}
        />
      )}
      {isAddingStudents && activeTab && (
        <StudentTeamForm
          courseId={course._id}
          teamSet={activeTab}
          onTeamCreated={handleAddStudentsUploaded}
        />
      )}
      {isAddingTAs && activeTab && (
        <TATeamForm
          courseId={course._id}
          teamSet={activeTab}
          onTeamCreated={handleAddTAsUploaded}
        />
      )}
    </Container>
  );
};

export default TeamsInfo;
