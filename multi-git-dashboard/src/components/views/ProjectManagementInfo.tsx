/* eslint-disable @typescript-eslint/no-unused-vars */
// import {
//   Alert,
//   Anchor,
//   Button,
//   Container,
//   Paper,
//   PasswordInput,
//   SegmentedControl,
//   Text,
//   TextInput,
//   Title,
// } from '@mantine/core';
// import { useForm } from '@mantine/form';
// import type { Role } from '@shared/types/auth/Role';
// import Roles from '@shared/types/auth/Role';
// import { IconInfoCircle } from '@tabler/icons-react';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { useState } from 'react';

import { Button, Container, Group, Notification, Tabs } from '@mantine/core';
import { TeamSet } from '@shared/types/TeamSet';
import { useEffect, useState } from 'react';
import ProjectManagementCard from '../cards/ProjectManagementCard';

interface ProjectManagementProps {
  courseId: string;
  teamSets: TeamSet[];
  jiraRegistrationStatus: boolean;
  hasFacultyPermission: boolean;
  onUpdate: () => void;
}

const ProjectManagementInfo: React.FC<ProjectManagementProps> = ({
  courseId,
  teamSets,
  jiraRegistrationStatus,
  hasFacultyPermission,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(
    teamSets ? teamSets[0]?.name : null
  );
  const [error, setError] = useState<string | null>(null);

  const setActiveTabAndSave = (tabName: string) => {
    onUpdate();
    setActiveTab(tabName);
    localStorage.setItem(`activeTeamSetTab_${courseId}`, tabName);
  };

  const handleOAuthButtonClick = () => {
    // Redirect the user to the backend /jira/authorize endpoint
    const apiRoute = `/api/jira/authorize?course=${courseId}`;
    window.location.href = apiRoute; // Update with your backend URL
  };

  useEffect(() => {
    const savedTab = localStorage.getItem(`activeTeamSetTab_${courseId}`);
    if (savedTab && teamSets.some(teamSet => teamSet.name === savedTab)) {
      setActiveTab(savedTab);
    }
  }, [teamSets]);

  const headers = teamSets.map((teamSet, index) => (
    <Tabs.Tab
      key={index}
      value={teamSet.name}
      onClick={() => {
        setActiveTabAndSave(teamSet.name);
      }}
    >
      {teamSet.name}
    </Tabs.Tab>
  ));

  const projectManagementCards = (teamSet: TeamSet) => {
    return teamSet.teams.map(team => (
      <ProjectManagementCard
        key={team._id}
        number={team.number}
        TA={team.TA}
        teamData={team.teamData}
      />
    ));
  };

  console.log(teamSets);

  return (
    <Container>
      <Tabs value={activeTab}>
        <Tabs.List style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          {headers}
        </Tabs.List>
        {error && (
          <Notification
            title="Error"
            color="red"
            onClose={() => setError(null)}
          >
            {error}
          </Notification>
        )}
        {hasFacultyPermission && (
          <Group style={{ marginBottom: '16px', marginTop: '16px' }}>
            {jiraRegistrationStatus ? (
              <Button onClick={handleOAuthButtonClick}>
                Reauthorize with Jira
              </Button>
            ) : (
              <Button onClick={handleOAuthButtonClick}>
                Authorize with Jira
              </Button>
            )}
          </Group>
        )}
        {teamSets.map(teamSet => (
          <Tabs.Panel key={teamSet._id} value={teamSet.name}>
            {projectManagementCards(teamSet)}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Container>
  );
};

export default ProjectManagementInfo;
