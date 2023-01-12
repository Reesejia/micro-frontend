import { reroute } from './navigations/reroute'

export let started = false
export function start() {
  started = true
  reroute() // 除了加载应用,还需要挂载
}
