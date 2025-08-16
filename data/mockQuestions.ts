import { QuizQuestion, QuizCategory } from '@/types/quiz';

export const categories: QuizCategory[] = [
  {
    id: 'intersections',
    name: 'Intersections',
    description: 'Master the rules of navigating through intersections safely',
    icon: 'intersection-icon.png',
    questionCount: 15
  },
  {
    id: 'road-signs',
    name: 'Road Signs',
    description: 'Learn to recognize and understand traffic signs and their meanings',
    icon: 'road-signs-icon.png',
    questionCount: 25
  },
  {
    id: 'traffic-rules',
    name: 'Traffic Rules',
    description: 'Essential traffic laws and regulations every driver must know',
    icon: 'rules-icon.png',
    questionCount: 20
  },
  {
    id: 'parking',
    name: 'Parking & Stopping',
    description: 'Proper parking techniques and stopping regulations',
    icon: 'intersection-icon.png',
    questionCount: 12
  }
];

export const mockQuestions: QuizQuestion[] = [
  {
    id: '1',
    category: 'intersections',
    question: 'At an intersection without traffic signals, a vehicle approaching from the right has:',
    type: 'multiple-choice',
    options: ['Right of way', 'Duty to yield', 'Equal rights with others', 'No special rights'],
    correct_answer: 'Right of way',
    explanation: 'At intersections without traffic signals, the "right-hand rule" applies - vehicles approaching from the right have right of way.'
  },
  {
    id: '2',
    category: 'road-signs',
    question: 'What does this traffic sign indicate?',
    type: 'multiple-choice',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=300&fit=crop',
    options: ['No entry', 'Mandatory stop', 'Warning of danger', 'Speed limit'],
    correct_answer: 'Warning of danger',
    explanation: 'Yellow triangular signs indicate warnings about various hazards on the road ahead.'
  },
  {
    id: '3',
    category: 'traffic-rules',
    question: 'What is the maximum speed limit in urban areas? (mph)',
    type: 'input',
    correct_answer: 25,
    explanation: 'The typical maximum speed limit in urban residential areas is 25 mph to ensure pedestrian safety.'
  },
  {
    id: '4',
    category: 'intersections',
    question: 'When making a left turn at a signalized intersection, a driver must:',
    type: 'multiple-choice',
    options: [
      'Yield to oncoming traffic going straight',
      'Have right of way over all vehicles',
      'Wait for a special turn signal',
      'Turn without additional rules'
    ],
    correct_answer: 'Yield to oncoming traffic going straight',
    explanation: 'When turning left, you must always yield to oncoming traffic going straight unless you have a protected left turn signal.'
  },
  {
    id: '5',
    category: 'parking',
    question: 'How far from an intersection is parking prohibited? (feet)',
    type: 'input',
    correct_answer: 15,
    explanation: 'Parking is typically prohibited within 15 feet of an intersection to maintain visibility and traffic flow.'
  },
  {
    id: '6',
    category: 'road-signs',
    question: 'A red octagonal sign means:',
    type: 'multiple-choice',
    options: ['Slow down', 'Yield to traffic', 'Complete stop required', 'Caution ahead'],
    correct_answer: 'Complete stop required',
    explanation: 'A red octagonal sign is a STOP sign, requiring drivers to come to a complete stop before proceeding.'
  },
  {
    id: '7',
    category: 'traffic-rules',
    question: 'When is it safe to change lanes?',
    type: 'multiple-choice',
    options: [
      'Only when the road is clear and you signal',
      'Anytime you need to',
      'Only during daylight hours',
      'When traffic is moving slowly'
    ],
    correct_answer: 'Only when the road is clear and you signal',
    explanation: 'Lane changes should only be made when it\'s safe, with adequate space, and after signaling your intention to other drivers.'
  }
];