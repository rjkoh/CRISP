import { JiraBoard, JiraEpic, JiraIssue, JiraSprint } from '@shared/types/JiraData';
import mongoose, { Schema } from 'mongoose';

const epicSchema: Schema = new Schema<JiraEpic>({
  id: { type: Number, required: true },
  key: { type: String, required: true },
  self: { type: String, required: true },
  name: { type: String, required: true },
  summary: { type: String, required: true },
  color: {
    key: { type: String, required: true }
  },
  issueColor: {
    key: { type: String, required: true }
  },
  done: { type: Boolean, required: true },
  jiraBoard: { type: Schema.Types.ObjectId, required: true }
});

const sprintSchema: Schema = new Schema<JiraSprint>({
  id: { type: Number, required: true },
  self: { type: String, required: true },
  state: { type: String, enum: ['active', 'closed', 'future'], required: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdDate: { type: Date, required: true },
  originBoardId: { type: Number, required: true },
  goal: { type: String, required: true },
  jiraBoard: { type: Schema.Types.ObjectId, required: true }
});

const issueSchema: Schema = new Schema<JiraIssue>({
  id: { type: String, required: true },
  self: { type: String, required: true },
  key: { type: String, required: true },
  statuscategorychangedate: { type: Date, required: true },
  issuetype: {
    name: { type: String, required: true },
    subtask: { type: Boolean, required: true }
  },
  jiraSprint: { type: Schema.Types.ObjectId, ref: 'Sprint' }, // Reference to Sprint
  jiraEpic: { type: Schema.Types.ObjectId, ref: 'Epic' }, // Reference to Epic
  jiraBoard: { type: Schema.Types.ObjectId, ref: 'Board' } // Reference to Board
  // Other fields...
});

const boardSchema: Schema = new Schema<JiraBoard>({
  id: { type: Number, required: true },
  self: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  jiraLocation: {
    projectId: { type: Number, required: true },
    displayName: { type: String, required: true },
    projectName: { type: String, required: true },
    projectKey: { type: String, required: true },
    projectTypeKey: { type: String, required: true },
    avatarURI: { type: String, required: true },
    name: { type: String, required: true }
  },
  jiraEpics: [{ type: Schema.Types.ObjectId, ref: 'JiraEpic' }],
  jiraSprints: [{ type: Schema.Types.ObjectId, ref: 'JiraSprint' }],
  jiraIssues: [{ type: Schema.Types.ObjectId, ref: 'JiraIssue' }]
});

const JiraEpicModel = mongoose.model<JiraEpic>('JiraEpic', epicSchema);
const JiraSprintModel = mongoose.model<JiraSprint>('JiraSprint', sprintSchema);
const JiraIssueModel = mongoose.model<JiraIssue>('JiraIssue', issueSchema);
const JiraBoardModel = mongoose.model<JiraBoard>('JiraBoard', boardSchema);

export {JiraEpicModel, JiraSprintModel, JiraIssueModel, JiraBoardModel};
