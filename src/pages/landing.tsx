import { NextPage } from 'next'
import React from 'react'
import { ImageCarousel } from '@/components/landingComponents/ImageCarousel'
import OverviewCard from '@/components/landingComponents/OverviewCard'
import { NavHeader } from '@/components/shared/Header/NavHeader'
import { Gallery } from '@/components/landingComponents/Gallery'
import { AboutProject } from '@/components/landingComponents/AboutProject'

const landing: NextPage = () => {
  return (
    <div>
      <NavHeader />
      <ImageCarousel />
      
      {/* Add id="overview" to match navigation */}
      <div id="overview">
        <OverviewCard />
      </div>
      
      {/* Add id="aboutProject" (check AboutProject component already has this) */}
      <AboutProject/>
      
      {/* Add id="gallery-media" (check Gallery component already has this) */}
      <Gallery/>
      
      {/* Optional: Add recent updates section if needed */}
      {/* <div id="updates">
        <RecentUpdates />
      </div> */}
    </div>
  )
}

export default landing