import { css } from '../../styled-system/css';
import { Button } from '@/components/ui/button' 

export default function Home() {
  return (
    <div className={css({ fontSize: "2xl", fontWeight: 'bold' })}>
      <p>Hello 🐼!</p>
      <Button variant="destructive">Button</Button>
    </div>
  )
}