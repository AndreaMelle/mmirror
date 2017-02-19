#include "SensorListener.h"
#include "Sensor.h"

using namespace Sensing;

using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;
using v8::Uint32;

Persistent<Function> SensorListener::s_constructor;

SensorListener::SensorListener(SensorDescr descr)
{
  // we need to register to the sensor singleton
  Sensor::GetInstance().AddListener(this, descr);
}

SensorListener::~SensorListener()
{
  // We need to de-register from the sensor singleton
  Sensor::GetInstance().RemoveListener(this);
  m_callback.Reset();
}

void SensorListener::OnStateChange(SensorState state) const
{
  Isolate * isolate = Isolate::GetCurrent();
  v8::HandleScope handleScope(isolate); // Required for Node 4.x

  const unsigned int argc = 1;
  Local<Value> argv[argc] = {
    Uint32::NewFromUnsigned(isolate, state)
  };

  Local<Function> cb = Local<Function>::New(isolate, m_callback);

  cb->Call(isolate->GetCurrentContext()->Global(), 1, argv);
}

void SensorListener::Create(v8::FunctionCallbackInfo<v8::Value> const& args)
{
  Isolate* isolate = args.GetIsolate();

  if(args.IsConstructCall())
  {
    // Construct call, i.e. new Object(...)
    uint32_t value = args[0]->Uint32Value();
    Local<Function> cb = Local<Function>::Cast(args[1]);

    SensorListener* obj = new SensorListener(value);
    obj->GetCallback().Reset(isolate, cb);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  }
  else
  {
    // Turn plain function invocation (Object(...)) into construct call
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Context> context = isolate->GetCurrentContext();
    Local<Function> cons = Local<Function>::New(isolate, s_constructor);
    Local<Object> result = cons->NewInstance(context, argc, argv).ToLocalChecked();
    args.GetReturnValue().Set(result);
  }

}

void SensorListener::Register(v8::Local<v8::Object> exports)
{
  Isolate* isolate = exports->GetIsolate();

  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, Create);

  tpl->SetClassName(
    String::NewFromUtf8(isolate, "SensorListener")
  );

  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  // NODE_SET_PROTOTYPE_METHOD(tpl, "plusOne", PlusOne);

  s_constructor.Reset(isolate, tpl->GetFunction());
  exports->Set(
    String::NewFromUtf8(isolate, "SensorListener"),
    tpl->GetFunction()
  );
}
