import Account from '../models/Account';
import Team from '../models/Team';
import TeamSet from '../models/TeamSet';
import User from '../models/User';
import Course from '../models/Course';
import { BadRequestError, NotFoundError } from './errors';

export const deleteTeamById = async (teamId: string) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team not found');
  }
  const teamSet = await TeamSet.findById(team.teamSet);
  if (teamSet && teamSet.teams) {
    const index = teamSet.teams.indexOf(team._id);
    if (index !== -1) {
      teamSet.teams.splice(index, 1);
    }
    await teamSet.save();
  }
  await Team.findByIdAndDelete(teamId);
};

export const updateTeamById = async (teamId: string, updateData: any) => {
  const updatedTeam = await Team.findByIdAndUpdate(teamId, updateData, {
    new: true,
  });
  if (!updatedTeam) {
    throw new NotFoundError('Team not found');
  }
};

export const addStudentsToTeam = async (courseId: string, students: any[]) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }
  for (const studentData of students) {
    const studentId = studentData.identifier;
    const student = await User.findOne({ identifier: studentId });
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    const account = await Account.findOne({ user: student._id });
    if (
      !account ||
      account.role !== 'Student' ||
      !student.enrolledCourses.includes(course._id) ||
      !course.students.some(s => s._id.equals(student._id)) ||
      !studentData.teamSet ||
      !studentData.teamNumber
    ) {
      throw new BadRequestError('Invalid Student');
    }
    let teamSet = await TeamSet.findOne({
      course: course._id,
      name: studentData.teamSet,
    });
    if (!teamSet) {
      throw new NotFoundError('TeamSet not found');
    }
    let team = await Team.findOne({
      number: studentData.teamNumber,
      teamSet: teamSet._id,
    });
    if (!team) {
      team = new Team({
        number: studentData.teamNumber,
        teamSet: teamSet._id,
        members: [],
      });
      if (!teamSet.teams) {
        teamSet.teams = [];
      }
      teamSet.teams.push(team._id);
    }
    if (team.members && !team.members.some(s => s._id === student._id)) {
      team.members.push(student._id);
    }
    await team.save();
    await teamSet.save();
  }
  await course.save();
};

export const addTAsToTeam = async (courseId: string, tas: any[]) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }
  for (const taData of tas) {
    const taId = taData.identifier;
    const ta = await User.findOne({ identifier: taId });
    if (!ta) {
      throw new NotFoundError('TA not found');
    }
    const account = await Account.findOne({ user: ta._id });
    if (
      !account ||
      account.role !== 'Teaching assistant' ||
      !ta.enrolledCourses.includes(course._id) ||
      !course.TAs.some(t => t._id.equals(ta._id)) ||
      !taData.teamSet ||
      !taData.teamNumber
    ) {
      throw new BadRequestError('Invalid TA');
    }
    let teamSet = await TeamSet.findOne({
      course: course._id,
      name: taData.teamSet,
    });
    if (!teamSet) {
      throw new NotFoundError('TeamSet not found');
    }
    let team = await Team.findOne({
      number: taData.teamNumber,
      teamSet: teamSet._id,
    });
    if (!team) {
      team = new Team({
        number: taData.teamNumber,
        teamSet: teamSet._id,
        members: [],
        TA: null,
      });
      if (!teamSet.teams) {
        teamSet.teams = [];
      }
      teamSet.teams.push(team._id);
    }
    team.TA = ta._id;
    await team.save();
    await teamSet.save();
  }
  await course.save();
};
