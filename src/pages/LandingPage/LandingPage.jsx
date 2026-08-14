import Hero from '../../components/sections/Hero/Hero'
import HeroCampaignSlider from '../../components/sections/Hero/HeroCampaignSlider'

const LandingPage = () => {
  return (
    <main>
      <HeroCampaignSlider normalHero={<Hero />} />
    </main>
  )
}

export default LandingPage
