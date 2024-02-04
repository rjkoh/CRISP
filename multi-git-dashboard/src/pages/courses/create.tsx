import {
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Collapse,
  List,
  MultiSelect,
  SegmentedControl,
  Space,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { CourseType } from '@shared/types/Course';
import { TeamData } from '@shared/types/TeamData';
import { IconBrandGithub, IconCheck } from '@tabler/icons-react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

const CARD_W = '210px';
// TODO: Setup webhook receiver to automatically get the org name where user installed GH app
const gitHubNewInstallationUrl =
  'https://github.com/apps/NUS-CRISP/installations/new';

enum InstallationStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

const CreateCoursePage: React.FC = () => {
  const router = useRouter();
  const apiRoute = '/courses';

  const [appInstallationStatus, setAppInstallationStatus] =
    useState<InstallationStatus>(InstallationStatus.IDLE);

  const [repoList, setRepoList] = useState([] as string[]);
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm({
    initialValues: {
      name: '',
      code: '',
      semester: '',
      courseType: CourseType.Normal,
      gitHubOrgName: '',
      installationId: '',
    },
    validate: {
      name: value =>
        value.trim().length > 0 ? null : 'Course name is required',
      code: value =>
        value.trim().length > 0 ? null : 'Course code is required',
      semester: value =>
        value.trim().length > 0 ? null : 'Semester is required',
      courseType: value => (value ? null : 'Course type is required'),
      // field should be valid only if courseType is Normal, or if courseType is GitHubOrg and installation check is successful
      gitHubOrgName: (value, values) =>
        values.courseType === CourseType.Normal ||
        (values.courseType === CourseType.GitHubOrg &&
          appInstallationStatus === InstallationStatus.SUCCESS)
          ? null
          : 'GitHub Org name is required',
    },
  });

  const checkAppInstallation = async (orgName: string) => {
    const checkAppInstallationApiRoute = '/api/github/check-installation';
    const reposApiRoute = `/api/teamdatas/${orgName}`;

    setAppInstallationStatus(InstallationStatus.LOADING);
    setErrorMessage('');

    try {
      const response = await fetch(checkAppInstallationApiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orgName }),
      });

      if (!response.ok) {
        setAppInstallationStatus(InstallationStatus.ERROR);
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'An error occurred');
        return;
      }
      const { installationId } = await response.json();
      form.setFieldValue('installationId', installationId);

      const reposResponse = await fetch(reposApiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orgName }),
      });

      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const teamDatas: TeamData[] = await reposResponse.json();
      setRepoList(teamDatas.map(teamData => teamData.repoName));

      setAppInstallationStatus(InstallationStatus.SUCCESS);
    } catch (error) {
      setAppInstallationStatus(InstallationStatus.ERROR);
      setErrorMessage('Failed to connect to the server');
    }
  };

  const handleSubmit = async () => {
    const session = await getSession();
    const accountId = session?.user?.id;

    const response = await fetch(apiRoute, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${accountId}`,
      },
      body: JSON.stringify(form.values),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error creating course:', data);
      return;
    }

    router.push(`/courses/${data._id}?new=true`);
  };

  return (
    <Box maw={300} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          withAsterisk
          label="Course Name"
          {...form.getInputProps('name')}
          value={form.values.name}
          onChange={event =>
            form.setFieldValue('name', event.currentTarget.value)
          }
        />
        <TextInput
          withAsterisk
          label="Course Code"
          {...form.getInputProps('code')}
          value={form.values.code}
          onChange={event =>
            form.setFieldValue('code', event.currentTarget.value)
          }
        />
        <TextInput
          withAsterisk
          label="Semester"
          {...form.getInputProps('semester')}
          value={form.values.semester}
          onChange={event =>
            form.setFieldValue('semester', event.currentTarget.value)
          }
        />
        <Space h="md" />
        <Box>
          <SegmentedControl
            data={[
              { value: CourseType.Normal, label: 'Normal' },
              { value: CourseType.GitHubOrg, label: 'GitHub Org' },
            ]}
            {...form.getInputProps('courseType')}
          />

          <Collapse in={form.values.courseType === CourseType.GitHubOrg}>
            <Box>
              <Title order={4} my={15}>
                GitHub Org Integration Setup:
              </Title>
              <Card withBorder>
                <List>
                  <List.Item>
                    <Button
                      w={CARD_W}
                      leftSection={<IconBrandGithub size={14} />}
                      variant="default"
                      component="a"
                      href={gitHubNewInstallationUrl}
                      target="_blank"
                    >
                      Install our GitHub App
                    </Button>
                  </List.Item>
                  <Collapse
                    in={appInstallationStatus !== InstallationStatus.SUCCESS}
                    mt="md"
                  >
                    <List.Item>
                      <TextInput
                        withAsterisk
                        label="GitHub Org Name"
                        placeholder="e.g. nus-crisp"
                        {...form.getInputProps('gitHubOrgName')}
                        onChange={event => {
                          form.setFieldValue(
                            'gitHubOrgName',
                            event.currentTarget.value
                          );
                          form.setFieldValue('installationId', '');
                          setAppInstallationStatus(InstallationStatus.IDLE);
                          setErrorMessage('');
                        }}
                      />
                      <Space h="sm" />
                      {errorMessage && (
                        <Text
                          style={{
                            maxWidth: CARD_W,
                          }}
                          c="red"
                        >
                          {errorMessage}
                        </Text>
                      )}
                      <Button
                        type="button"
                        loading={
                          appInstallationStatus === InstallationStatus.LOADING
                        }
                        variant={
                          appInstallationStatus === InstallationStatus.SUCCESS
                            ? 'filled'
                            : 'outline'
                        }
                        color={
                          appInstallationStatus === InstallationStatus.SUCCESS
                            ? 'green'
                            : appInstallationStatus === InstallationStatus.ERROR
                              ? 'red'
                              : 'blue'
                        }
                        rightSection={
                          appInstallationStatus ===
                          InstallationStatus.SUCCESS ? (
                            <IconCheck size={14} />
                          ) : null
                        }
                        onClick={() =>
                          checkAppInstallation(form.values.gitHubOrgName)
                        }
                      >
                        {appInstallationStatus === InstallationStatus.ERROR
                          ? 'Try Again'
                          : 'Check Installation'}
                      </Button>
                    </List.Item>
                  </Collapse>
                  <Collapse
                    in={appInstallationStatus === InstallationStatus.SUCCESS}
                    mt="md"
                  >
                    <List.Item>
                      <Badge
                        variant="outline"
                        color="green"
                        size="lg"
                        rightSection={
                          <CloseButton
                            style={{ color: '#40c057' }} // open-color, green 6
                            onClick={() => {
                              setAppInstallationStatus(InstallationStatus.IDLE);
                              setErrorMessage('');
                              form.setFieldValue('gitHubOrgName', '');
                            }}
                            size={14}
                          />
                        }
                      >
                        {form.values.gitHubOrgName}
                      </Badge>
                      <MultiSelect
                        mt="sm"
                        label="Repositories"
                        placeholder="Pick repos..."
                        data={repoList}
                        hidePickedOptions
                        searchable
                        clearable
                        leftSectionWidth={100}
                      />
                    </List.Item>
                  </Collapse>
                </List>
              </Card>
            </Box>
          </Collapse>
        </Box>
        <Space h="md" />
        <Button type="submit">Create Course</Button>
      </form>
    </Box>
  );
};

export default CreateCoursePage;
