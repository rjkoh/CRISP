import { Box, Group, MultiSelect, ScrollArea, Text, useMantineTheme } from '@mantine/core';
import { TeamData } from '@shared/types/TeamData';
import classes from '@styles/table-of-contents.module.css';
import cx from 'clsx';
import { useState } from 'react';
import { PRProps } from './PR';

interface PRListProps {
  team?: PRProps['team'];
  teamPRs: TeamData['teamPRs'];
  selectedPR: number | null;
  onSelectPR: (prId: number) => void;
  maxHeight: number;
}

const PRList: React.FC<PRListProps> = ({
  team,
  teamPRs,
  selectedPR,
  onSelectPR,
  maxHeight,
}) => {
  const theme = useMantineTheme();
  const [selected, setSelected] = useState<string[]>([]);

  const displayedPRs = teamPRs.filter((pr) => {
    if (!selected) return true;
    return selected.includes(pr.user);
  });

  return (
    <div>
      {team && <Group mb="md">
        <MultiSelect
          checkIconPosition='right'
          placeholder="Filter pull requests"
          clearable
          searchable
          data={[
            { group: 'Members', items: team.members.map((member) => member.gitHandle === '' ? member.name : member.gitHandle) },
            { group: 'Status', items: ['Open', 'Closed', 'Merged'] },
          ]}
          value={selected}
          onChange={setSelected}
        />
      </Group>}
      <ScrollArea.Autosize mah={`calc(${maxHeight}px - 6rem)`} scrollbars="y">
        {displayedPRs.map(pr => (
          <Box<'a'>
            component="a"
            onClick={() => onSelectPR(pr.id)}
            key={pr.id}
            className={cx(classes.link, {
              [classes.linkActive]: pr.id === selectedPR,
            })}
            mr={3}
          >
            <Text size="sm"><Text span fw={700} c={theme.colors.green[5]} inherit>{pr.user}</Text> - {pr.title}</Text>
          </Box>
        ))}
      </ScrollArea.Autosize>
    </div>
  );
};

export default PRList;
