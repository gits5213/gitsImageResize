import { join } from 'node:path'

const root = join(process.cwd(), 'tests/fixtures/generated')

export const fixtures = {
  png: join(root, 'profile-photo.png'),
  jpeg: join(root, 'vacation.jpg'),
  alpha: join(root, 'alpha.png'),
  text: join(root, 'notes.txt'),
  gif: join(root, 'anim.gif'),
  corrupt: join(root, 'corrupt.png'),
  subject: join(root, 'subject.png'),
  noisyPng: join(root, 'noisy.png'),
  noisyJpeg: join(root, 'noisy.jpg'),
}
