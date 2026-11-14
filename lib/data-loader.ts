import fs from "fs";
import path from "path";
import { z } from "zod";
import {
  SkillCatalogueItemSchema,
  QuestionItemSchema,
  CareerCatalogueItemSchema,
  ResourceItemSchema,
  type SkillCatalogueItem,
  type QuestionItem,
  type CareerCatalogueItem,
  type ResourceItem,
  type CareerId,
} from "./schemas/domain.schema";

interface CatalogCache {
  skills: SkillCatalogueItem[];
  careers: CareerCatalogueItem[];
  questions: QuestionItem[];
  resources: ResourceItem[];
}

let cachedData: CatalogCache | null = null;

function loadJsonFile<T>(filename: string): unknown {
  const filePath = path.join(process.cwd(), "data", filename);
  const fileContents = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContents);
}

export function loadCatalogData(): CatalogCache {
  if (cachedData) {
    return cachedData;
  }

  const rawSkills = loadJsonFile("skills.json");
  const rawCareers = loadJsonFile("careers.json");
  const rawQuestions = loadJsonFile("questions.json");
  const rawResources = loadJsonFile("resources.json");

  const skills = z.array(SkillCatalogueItemSchema).parse(rawSkills);
  const careers = z.array(CareerCatalogueItemSchema).parse(rawCareers);
  const questions = z.array(QuestionItemSchema).parse(rawQuestions);
  const resources = z.array(ResourceItemSchema).parse(rawResources);

  // Referential integrity validation
  const skillMap = new Map<string, Set<string>>();
  for (const skill of skills) {
    const topicTags = new Set(skill.microTopics.map((mt) => mt.tag));
    skillMap.set(skill.id, topicTags);
  }

  // Verify careers.json
  for (const career of careers) {
    for (const req of career.requirements) {
      const topicSet = skillMap.get(req.skillId);
      if (!topicSet) {
        throw new Error(
          `Referential Integrity Error: Career "${career.id}" references unknown skillId "${req.skillId}".`
        );
      }
      for (const criticalTag of req.criticalTopicTags) {
        if (!topicSet.has(criticalTag)) {
          throw new Error(
            `Referential Integrity Error: Career "${career.id}" references unknown criticalTopicTag "${criticalTag}" for skill "${req.skillId}".`
          );
        }
      }
    }
  }

  // Verify questions.json
  for (const q of questions) {
    const topicSet = skillMap.get(q.skillId);
    if (!topicSet) {
      throw new Error(
        `Referential Integrity Error: Question "${q.id}" references unknown skillId "${q.skillId}".`
      );
    }
    if (!topicSet.has(q.topicTag)) {
      throw new Error(
        `Referential Integrity Error: Question "${q.id}" references unknown topicTag "${q.topicTag}" for skill "${q.skillId}".`
      );
    }
  }

  // Verify resources.json
  for (const res of resources) {
    const topicSet = skillMap.get(res.skillId);
    if (!topicSet) {
      throw new Error(
        `Referential Integrity Error: Resource "${res.id}" references unknown skillId "${res.skillId}".`
      );
    }
    for (const tag of res.topicTags) {
      if (!topicSet.has(tag)) {
        throw new Error(
          `Referential Integrity Error: Resource "${res.id}" references unknown topicTag "${tag}" for skill "${res.skillId}".`
        );
      }
    }
  }

  cachedData = { skills, careers, questions, resources };
  return cachedData;
}

export function getSkillsCatalogue(): SkillCatalogueItem[] {
  return loadCatalogData().skills;
}

export function getCareersCatalogue(): CareerCatalogueItem[] {
  return loadCatalogData().careers;
}

export function getQuestionsCatalogue(): QuestionItem[] {
  return loadCatalogData().questions;
}

export function getResourcesCatalogue(): ResourceItem[] {
  return loadCatalogData().resources;
}

export function getCareerById(id: CareerId): CareerCatalogueItem | undefined {
  return getCareersCatalogue().find((c) => c.id === id);
}

export function getSkillById(id: string): SkillCatalogueItem | undefined {
  return getSkillsCatalogue().find((s) => s.id === id);
}

export function getQuestionsBySkill(skillId: string): QuestionItem[] {
  return getQuestionsCatalogue().filter((q) => q.skillId === skillId);
}

export function getResourcesBySkillAndTopics(
  skillId: string,
  topicTags?: string[]
): ResourceItem[] {
  const allForSkill = getResourcesCatalogue().filter((r) => r.skillId === skillId);
  if (!topicTags || topicTags.length === 0) {
    return allForSkill;
  }
  const tagSet = new Set(topicTags);
  const matched = allForSkill.filter((r) => r.topicTags.some((t) => tagSet.has(t)));
  return matched.length > 0 ? matched : allForSkill;
}

