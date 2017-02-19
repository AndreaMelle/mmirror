#ifndef __PIR_H__
#define __PIR_H__

#include "SensorTypes.h"

namespace Sensing
{
  class PIR
  {
  public:
    static const SensorState Presence = 1;
    static const SensorState Absence = 0;

    void Open();
    void Close();

    void Update();

    inline SensorState GetState() const { return m_pirState; }

  private:
    SensorState m_pirState;

  };
}

#endif //__PIR_H__
